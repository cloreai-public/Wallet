import dynamic from 'next/dynamic';

const App = dynamic(() => import('components/router/app-router'), {
  ssr: false,
});

export async function generateStaticParams() {
  return [
    // authenticate
    { all: ['dashboard'] },
    { all: ['contactsManager'] },
    { all: ['history'] },
    { all: ['walletsManager'] },
    { all: ['send'] },
    { all: ['sign'] },
    { all: ['poh'] },
    // unauthenticate
    { all: ['register'] },
    { all: ['check'] },
    { all: ['create'] },
  ];
}

export default function Page() {
  return <App />;
}
