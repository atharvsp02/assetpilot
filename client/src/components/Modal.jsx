export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2a2623]/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-[#e6e3df]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e6e3df] px-5 py-3">
          <h3 className="font-semibold text-[#37322f]">{title}</h3>
          <button onClick={onClose} className="text-[#a39c94] hover:text-[#605a57]">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#e6e3df] px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}
