import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export function RouteError() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <section className="route-status" aria-labelledby="route-error-title">
      <p className="route-status__eyebrow">WePick</p>
      <h1 id="route-error-title">
        {isNotFound ? '화면을 찾을 수 없어요' : '화면을 불러오지 못했어요'}
      </h1>
      <p>{isNotFound ? '주소를 다시 확인해 주세요.' : '잠시 후 다시 시도해 주세요.'}</p>
      <Link className="route-status__link" to="/">
        오늘의 Pick으로 이동
      </Link>
    </section>
  );
}
