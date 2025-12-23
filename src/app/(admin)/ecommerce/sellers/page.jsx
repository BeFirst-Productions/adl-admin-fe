import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import SellersList from './components/SellersList';
import { useEffect, useState } from 'react';
import { getAllUsers } from '@/api/apis';
const Sellers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const userData = await getAllUsers()
      if (userData?.data?.success) {

        setUsers(userData.data.data)
      }
    };
    fetchData();
  }, []);
  return <>
    <PageBreadcrumb subName="Users" title="Users List" />
    <PageMetaData title="User Management" />
    {users && <SellersList users={users} />}
  </>;
};
export default Sellers;