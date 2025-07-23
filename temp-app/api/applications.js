export default function handler(req, res) {
  // Placeholder data; replace with real DB logic as needed
  res.status(200).json([
    { id: 1, name: 'Sample Application', status: 'approved' },
    { id: 2, name: 'Test Application', status: 'pending' }
  ]);
} 