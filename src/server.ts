import app from './app';

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serve running on http://localhost:${PORT}`);
});