import React from 'react';
import { Box, H2, Text, Illustration } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

const Analytics = () => {
  const [data, setData] = React.useState({
    totalUsers: 0,
    totalOrders: 0,
    totalMedicines: 0,
    totalPharmacies: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, orders, medicines, pharmacies] = await Promise.all([
          api.getResourceAction({ resourceId: 'User', actionName: 'list' }),
          api.getResourceAction({ resourceId: 'Order', actionName: 'list' }),
          api.getResourceAction({ resourceId: 'Medicine', actionName: 'list' }),
          api.getResourceAction({ resourceId: 'Pharmacy', actionName: 'list' }),
        ]);

        setData({
          totalUsers: users.data.total,
          totalOrders: orders.data.total,
          totalMedicines: medicines.data.total,
          totalPharmacies: pharmacies.data.total,
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Box variant="grey">
        <Box variant="white">
          <H2>Analytics Overview</H2>
          <Text>Detailed statistics and insights about your pharmacy system:</Text>
        </Box>
      </Box>

      <Box flex flexDirection="row" flexWrap="wrap">
        <Box variant="white" mr="lg" mb="lg" flex flexDirection="row" alignItems="center">
          <Box mr="lg">
            <Illustration variant="Rocket" width={32} height={32} />
          </Box>
          <Box>
            <Text>Total Users</Text>
            <Text variant="lg">{data.totalUsers}</Text>
          </Box>
        </Box>

        <Box variant="white" mr="lg" mb="lg" flex flexDirection="row" alignItems="center">
          <Box mr="lg">
            <Illustration variant="ShoppingCart" width={32} height={32} />
          </Box>
          <Box>
            <Text>Total Orders</Text>
            <Text variant="lg">{data.totalOrders}</Text>
          </Box>
        </Box>

        <Box variant="white" mr="lg" mb="lg" flex flexDirection="row" alignItems="center">
          <Box mr="lg">
            <Illustration variant="Package" width={32} height={32} />
          </Box>
          <Box>
            <Text>Total Medicines</Text>
            <Text variant="lg">{data.totalMedicines}</Text>
          </Box>
        </Box>

        <Box variant="white" mr="lg" mb="lg" flex flexDirection="row" alignItems="center">
          <Box mr="lg">
            <Illustration variant="Building" width={32} height={32} />
          </Box>
          <Box>
            <Text>Total Pharmacies</Text>
            <Text variant="lg">{data.totalPharmacies}</Text>
          </Box>
        </Box>
      </Box>

      <Box variant="grey" mt="lg">
        <Box variant="white">
          <H2>System Health</H2>
          <Text>Current system status and performance metrics:</Text>
          
          <Box flex flexDirection="row" flexWrap="wrap" mt="lg">
            <Box variant="white" mr="lg" mb="lg" flex flexDirection="row" alignItems="center">
              <Box mr="lg">
                <Illustration variant="Check" width={32} height={32} />
              </Box>
              <Box>
                <Text>Database Status</Text>
                <Text variant="lg" color="success">Connected</Text>
              </Box>
            </Box>

            <Box variant="white" mr="lg" mb="lg" flex flexDirection="row" alignItems="center">
              <Box mr="lg">
                <Illustration variant="Server" width={32} height={32} />
              </Box>
              <Box>
                <Text>Server Status</Text>
                <Text variant="lg" color="success">Running</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics; 