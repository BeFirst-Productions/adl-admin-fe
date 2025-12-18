
import { useState, useEffect } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { deleteUser, editUser } from '@/api/apis';

const SellersListView = ({ users: initialUsers }) => {
  // State for users data
  const [users, setUsers] = useState(initialUsers);

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with parent component's users prop
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Handle edit button click
  const handleEditClick = (user) => {
    setCurrentUser({ ...user }); // Create a copy to avoid direct state mutation
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteUser(userToDelete._id);

      if (response.data.success) {
        toast.success(response.data.message);
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
      } else {
        toast.error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Save edited user
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      
      const response = await editUser(currentUser);
      if (response.data.success) {
        toast.success(response.data.message);
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === currentUser._id ? currentUser : user
        )); 
      }
      setShowEditModal(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'An error occurred while updating');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="table-responsive table-centered text-nowrap">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user._id}> {/* Use _id instead of index for key */}
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <Link to="">{user?.name}</Link>
                    </div>
                  </td>
                  <td>{user?.email}</td>
                  <td>{user?.role}</td>
                  <td>
                    <Button
                      variant="soft-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(user)}
                      disabled={isDeleting || isSaving}
                    >
                      <IconifyIcon icon="bx:edit" className="fs-18" />
                    </Button>
                    <Button
                      variant="soft-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      disabled={isDeleting || isSaving}
                    >
                      <IconifyIcon icon="bx:trash" className="fs-18" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination code remains the same */}
      </Card>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => !isSaving && setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </Form.Control>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => !isDeleting && setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SellersListView;