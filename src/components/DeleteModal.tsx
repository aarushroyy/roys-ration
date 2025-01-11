import React from 'react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Clear List</h2>
        <p className="text-lg text-gray-700 mb-6">
          Are you sure you want to clear the entire list? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 p-4 bg-gray-200 hover:bg-gray-300 rounded-xl text-lg font-semibold text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 p-4 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-semibold text-white"
          >
            Delete All
          </button>
        </div>
      </div>
    </div>
  )
}