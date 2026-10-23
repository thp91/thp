import { useEffect, useRef } from 'react';

/** Boîte de dialogue modale (<dialog> natif : focus piégé, Échap, retour du focus). */
export default function Modal({ title, subtitle, onClose, children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="admin-modal"
      aria-labelledby="admin-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => event.target === ref.current && onClose()}
    >
      <div className="admin-modal__panel">
        <header className="admin-modal__header">
          <div>
            <h2 className="admin-modal__title" id="admin-modal-title">
              {title}
            </h2>
            {subtitle && <p className="admin-muted">{subtitle}</p>}
          </div>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>
        <div className="admin-modal__body">{children}</div>
        <footer className="admin-modal__footer">{footer}</footer>
      </div>
    </dialog>
  );
}
