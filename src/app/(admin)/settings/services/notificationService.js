import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(userId) {
    if (this.socket?.connected) {
      console.log('✓ Socket already connected');
      return;
    }

    // Connect to your backend Socket.IO server
    this.socket = io(process.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        userId,
        token: localStorage.getItem('authToken'),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✓ Socket.IO connected:', this.socket.id);
      toast.success('Real-time notifications enabled', { autoClose: 2000 });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('✗ Socket.IO disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen to notification events
    this.setupNotificationListeners();
  }

  // Setup all notification listeners
  setupNotificationListeners() {
    // New Enquiry
    this.socket.on('new:enquiry', (data) => {
      this.handleNotification({
        type: 'enquiry',
        title: 'New Enquiry Received',
        message: `${data.name} sent an enquiry: "${data.subject}"`,
        icon: 'bx:message-dots',
        data,
      });
    });

    // New Newsletter Subscription
    this.socket.on('new:newsletter', (data) => {
      this.handleNotification({
        type: 'newsletter',
        title: 'New Newsletter Subscription',
        message: `${data.email} subscribed to newsletter`,
        icon: 'bx:mail-send',
        data,
      });
    });

    // New User Registration
    this.socket.on('new:user', (data) => {
      this.handleNotification({
        type: 'user',
        title: 'New User Registered',
        message: `${data.name} just created an account`,
        icon: 'bx:user-plus',
        data,
      });
    });

    // New Blog Post
    this.socket.on('new:blog', (data) => {
      this.handleNotification({
        type: 'blog',
        title: 'New Blog Published',
        message: `"${data.title}" has been published`,
        icon: 'bx:edit',
        data,
      });
    });

    // System Alerts
    this.socket.on('system:alert', (data) => {
      this.handleNotification({
        type: 'alert',
        title: 'System Alert',
        message: data.message,
        icon: 'bx:error-circle',
        data,
        urgent: true,
      });
    });
  }

  // Handle incoming notifications
  handleNotification(notification) {
    const settings = this.getNotificationSettings();

    // Check if this type of notification is enabled
    const typeKey = `new${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`;
    if (settings[typeKey] === false && !notification.urgent) {
      return; // User has disabled this notification type
    }

    // Show toast notification
    if (settings.emailNotifications) {
      toast.info(
        <div className="d-flex align-items-start gap-2">
          <div className="flex-shrink-0">
            <i className={`bx ${notification.icon} fs-20`}></i>
          </div>
          <div className="flex-grow-1">
            <strong className="d-block mb-1">{notification.title}</strong>
            <span className="small">{notification.message}</span>
          </div>
        </div>,
        {
          autoClose: 5000,
          position: 'top-right',
        }
      );
    }

    // Show desktop notification
    if (settings.desktopNotifications && Notification.permission === 'granted') {
      this.showDesktopNotification(notification);
    }

    // Play sound
    if (settings.soundEnabled) {
      this.playNotificationSound();
    }

    // Store notification in local state/storage
    this.storeNotification(notification);

    // Emit to custom listeners
    this.emit('notification', notification);
  }

  // Show desktop notification
  showDesktopNotification(notification) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notif = new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: notification.type,
      requireInteraction: notification.urgent,
    });

    notif.onclick = () => {
      window.focus();
      // Navigate to relevant page
      this.navigateToNotification(notification);
      notif.close();
    };
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Store notification
  storeNotification(notification) {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    stored.unshift({
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    });
    
    // Keep only last 50 notifications
    localStorage.setItem('notifications', JSON.stringify(stored.slice(0, 50)));
    
    // Emit update event
    this.emit('notifications:update', stored);
  }

  // Get notification settings
  getNotificationSettings() {
    const settings = localStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : {
      emailNotifications: true,
      desktopNotifications: true,
      soundEnabled: true,
      newEnquiry: true,
      newNewsletter: true,
      newUser: true,
      newBlog: false,
      systemAlerts: true,
    };
  }

  // Navigate to notification
  navigateToNotification(notification) {
    const routes = {
      enquiry: '/enquiry',
      newsletter: '/newsletters',
      user: '/users',
      blog: '/blogs',
    };
    
    const route = routes[notification.type];
    if (route && window.location.pathname !== route) {
      window.location.href = route;
    }
  }

  // Custom event emitter
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => callback(data));
  }

  // Get all notifications
  getNotifications() {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    this.emit('notifications:update', updated);
  }

  // Mark all as read
  markAllAsRead() {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    this.emit('notifications:update', updated);
  }

  // Clear all notifications
  clearAll() {
    localStorage.setItem('notifications', JSON.stringify([]));
    this.emit('notifications:update', []);
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('✓ Socket.IO disconnected');
    }
  }
}

// Export singleton instance
export default new NotificationService();