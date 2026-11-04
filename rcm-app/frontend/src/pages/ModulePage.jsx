export default function ModulePage({ title }) {
  return (
    <>
      <div className="page-head"><div><h1>{title}</h1><p className="page-sub">Not available in this release</p></div></div>
      <div className="card empty-module">
        <p>The {title} module is not part of the provided requirements and reference screens, so it has not been built yet. Dashboard, Claims and Denials are fully functional.</p>
      </div>
    </>
  );
}
