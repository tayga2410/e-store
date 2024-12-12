'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function Breadcrumb() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryName = searchParams.get('categoryName'); 

  const handleNavigateHome = () => {
    router.push('/'); 
  };

  const handleNavigateCatalog = () => {
    router.push('/catalog'); 
  };

  return (
    <nav className="breadcrumb">
      <span onClick={handleNavigateHome} className="breadcrumb__link">
        Home
      </span>
      {' > '}
      <span onClick={handleNavigateCatalog} className="breadcrumb__link">
        Catalog
      </span>
      {categoryName && (
        <>
          {' > '}
          <span className="breadcrumb__current">{categoryName}</span>
        </>
      )}
    </nav>
  );
}
