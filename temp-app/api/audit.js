export default function handler(req, res) {
  // Placeholder data; replace with real audit log logic as needed
  res.status(200).json([
    { id: 1, action: 'upload', user: 'admin', timestamp: new Date().toISOString() },
    { id: 2, action: 'review', user: 'auditor', timestamp: new Date().toISOString() }
  ]);
} 