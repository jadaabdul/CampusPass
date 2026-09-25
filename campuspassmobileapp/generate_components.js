const fs = require('fs');
const path = require('path');

const components = [
  'EmptyState',
  'EventCard',
  'EventReviews',
  'InfoCard',
  'Modal',
  'Navbar',
  'NotificationBell',
  'PageHeader',
  'Pagination',
  'QRCodeCard',
  'SearchFilterBar',
  'StatCard',
  'StatusBadge'
];

const dirPath = path.join(__dirname, 'src', 'components');

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

components.forEach(comp => {
  const filePath = path.join(dirPath, `${comp}.js`);
  const content = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ${comp} = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>${comp} Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
  }
});

export default ${comp};
`;

  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
});
