export const dataMode = import.meta.env.VITE_DATA_MODE === 'mock' ? 'mock' : 'real';

export async function enableMocking() {
  if (dataMode !== 'mock') return;

  if (import.meta.env.PROD) {
    throw new Error('Mock data mode is not allowed in a production build.');
  }

  const { worker } = await import('../mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
