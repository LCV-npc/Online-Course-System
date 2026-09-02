import React from 'react';
import { Outlet } from 'react-router';
import { Layout } from '../components/Layout';

export default function MainLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
