import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { useAuthContext } from '@/context/useAuthContext'
import { appRoutes, authRoutes } from '@/routes/index'
import AdminLayout from '@/layouts/AdminLayout'
import SignIn from '@/app/(other)/auth/sign-in/page'
import { lazy } from 'react'
import FAQManagement from '@/app/(admin)/faq/page'
import 'react-toastify/dist/ReactToastify.css'
import EnquiryManagement from '@/app/(admin)/enquiry/EnquiryManagement'
import PrivateRoute from '@/components/private/PrivateRoute'
const Pricing = lazy(() => import('@/app/(admin)/pages/pricing/page'))
import SeoLayout from '@/app/(admin)/seo/SeoLayout'
const Cards = lazy(() => import('@/app/(admin)/ui/cards/page'))

const Analytics = lazy(() => import('@/app/(admin)/dashboard/analytics/page'))
const Dashboard = lazy(() => import('@/app/(admin)/dashboard/page'))
const UserManagement = lazy(() => import('@/app/(admin)/ecommerce/sellers/page'))
const UserCreation = lazy(() => import('@/app/(admin)/forms/basic/page'))
const Blogs = lazy(() => import('@/app/(admin)/apps/contacts/page'))
const EcommerceProductDetails = lazy(() => import('@/app/(admin)/ecommerce/products/[productId]/page'))
const EcommerceProductCreate = lazy(() => import('@/app/(admin)/ecommerce/products/create/page'))
const Invoices = lazy(() => import('@/app/(admin)/invoices/page'))
const Settings = lazy(() => import('@/app/(admin)/settings/Page'))

const AppRouter = (props) => {
  const { isAuthenticated } = useAuthContext()
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />
        <Route
          path="/"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AdminLayout>
              <Analytics />
            </AdminLayout>
          }
        />

        <Route
          path="/user-management"
          element={
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          }
        />
        <Route
          path="/user-management/add"
          element={
            <AdminLayout>
              <UserCreation />
            </AdminLayout>
          }
        />
        <Route
          path="/faqs"
          element={
            <AdminLayout>
              <FAQManagement />
            </AdminLayout>
          }
        />
        <Route
          path="/enquiry"
          element={
            <AdminLayout>
              <EnquiryManagement />
            </AdminLayout>
          }
        />
        <Route
          path="/blogs"
          element={
            <AdminLayout>
              <Blogs />
            </AdminLayout>
          }
        />
        <Route
          path="/blogs/details/:blogId"
          element={
            <AdminLayout>
              <EcommerceProductDetails />
            </AdminLayout>
          }
        />
        <Route
          path="/blogs/add-blog"
          element={
            <AdminLayout>
              <EcommerceProductCreate />
            </AdminLayout>
          }
        />
        <Route
          path="/blogs/edit-blog/:blogId"
          element={
            <AdminLayout>
              <EcommerceProductCreate />
            </AdminLayout>
          }
        />
        <Route
          path="/newsletter/subscribers"
          element={
            <AdminLayout>
              <Invoices />
            </AdminLayout>
          }
        />
        <Route
          path="/seo"
          element={
            <AdminLayout>
              <SeoLayout />
            </AdminLayout>
          }
        />
        <Route
          path="/gallery"
          element={
            <AdminLayout>
              <Cards />
            </AdminLayout>
          }
        />

        <Route
          path="/packages"
          element={
            <AdminLayout>
              <Pricing />
            </AdminLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AdminLayout>
              <Settings />
            </AdminLayout>
          }
        />
      </Routes>
    </>
  )
}
export default AppRouter
