const fs = require('fs');
const path = require('path');

const screens = [
  // Auth
  { name: 'Login', folder: 'auth' },
  { name: 'Register', folder: 'auth' },
  { name: 'ForgotPassword', folder: 'auth' },
  { name: 'ResetPassword', folder: 'auth' },
  // Shared
  { name: 'EventDetail', folder: 'shared' },
  { name: 'EventMap', folder: 'shared' },
  { name: 'ETicket', folder: 'shared' },
  { name: 'Notifications', folder: 'shared' },
  { name: 'Profile', folder: 'shared' },
  // Student
  { name: 'Home', folder: 'student' },
  { name: 'BrowseEvents', folder: 'student' },
  { name: 'BookTickets', folder: 'student' },
  { name: 'Payment', folder: 'student' },
  { name: 'MyBookings', folder: 'student' },
  { name: 'Favorites', folder: 'student' },
  // Organizer
  { name: 'OrgDashboard', folder: 'organizer' },
  { name: 'CreateEvent', folder: 'organizer' },
  { name: 'ManageEvents', folder: 'organizer' },
  { name: 'Attendees', folder: 'organizer' },
  { name: 'QRScanPage', folder: 'organizer' },
  // Admin
  { name: 'AdminDashboard', folder: 'admin' },
  { name: 'ManageAllEvents', folder: 'admin' },
  { name: 'ManageUsers', folder: 'admin' },
  { name: 'UserDetails', folder: 'admin' },
  { name: 'ManageCategories', folder: 'admin' },
  { name: 'AddCategory', folder: 'admin' },
  { name: 'ManageVenues', folder: 'admin' },
  { name: 'CreateVenue', folder: 'admin' }
];

const baseDir = path.join(__dirname, 'src', 'screens');

screens.forEach(screen => {
  const dirPath = path.join(baseDir, screen.folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, `${screen.name}.js`);
  const content = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ${screen.name} = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${screen.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ${screen.name};
`;

  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
});
