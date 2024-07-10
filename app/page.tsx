import dynamic from 'next/dynamic';

const App = dynamic(() => import('components/router/app-router'), {
  ssr: false,
});

export default function Page() {
  return <App />;
}
