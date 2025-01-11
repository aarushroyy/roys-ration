import React, { useState, useEffect } from 'react'
import { PlusCircle, ListChecks, User, Trash2 } from 'lucide-react'
import { dbOperations } from '@/lib/supabase'
import { RationItem, FamilyMember, Screen } from '@/types'
import { DeleteModal } from './DeleteModal'


export const FamilyRationApp: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('profiles')
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null)
  const [items, setItems] = useState<RationItem[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [newItem, setNewItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load initial data and set up real-time subscription
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [itemsData, membersData] = await Promise.all([
          dbOperations.getItems(),
          dbOperations.getFamilyMembers()
        ])
        
        if (isMounted) {
          console.log('Loaded items:', itemsData) // Debug log
          setItems(itemsData)
          setFamilyMembers(membersData)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialData()

    const cleanup = dbOperations.subscribeToChanges((newItems) => {
      if (isMounted) {
        console.log('Received new items:', newItems) // Debug log
        setItems(newItems)
      }
    })

    return () => {
      isMounted = false
      cleanup()
    }
  }, [])

  const addItem = async () => {
    if (!newItem.trim() || !currentUser) return

    try {
      const addedItem = await dbOperations.addItem({
        name: newItem,
        quantity: quantity || '1',
        addedBy: currentUser.name
      })
      console.log('Added item:', addedItem) // Debug log
      setNewItem('')
      setQuantity('')
      // Refresh the list after adding
      const updatedItems = await dbOperations.getItems()
      setItems(updatedItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    }
  }

  const clearList = async () => {
    try {
      setIsDeleting(true)
      await dbOperations.clearList()
      setItems([])
      setIsDeleteModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear list')
    } finally {
      setIsDeleting(false)
    }
  }

  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-800">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {screen === 'profiles' && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Who are you?</h1>
          <div className="grid grid-cols-2 gap-4">
            {familyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setCurrentUser(member)
                  setScreen('menu')
                }}
                className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center border-2 border-gray-200"
              >
                <User size={48} className="mx-auto mb-4 text-blue-600" />
                <span className="text-2xl font-semibold text-gray-900">{member.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 'menu' && currentUser && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Hello, {currentUser.name}!
          </h1>
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setScreen('add')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center border-2 border-gray-200"
            >
              <PlusCircle size={48} className="mx-auto mb-4 text-green-600" />
              <span className="text-2xl font-semibold text-gray-900">Add Item</span>
            </button>
            <button
              onClick={() => setScreen('list')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center border-2 border-gray-200"
            >
              <ListChecks size={48} className="mx-auto mb-4 text-blue-600" />
              <span className="text-2xl font-semibold text-gray-900">View List</span>
            </button>
          </div>
          <button
            onClick={() => setScreen('profiles')}
            className="mt-4 w-full p-4 bg-gray-200 rounded-xl text-xl font-semibold text-gray-800 hover:bg-gray-300"
          >
            Switch Profile
          </button>
        </div>
      )}

      {screen === 'add' && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Add Item</h1>
          <div className="space-y-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter item name"
              className="w-full p-4 text-2xl rounded-xl border-2 border-gray-300 text-gray-900 placeholder-gray-500"
            />
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity (optional)"
              className="w-full p-4 text-2xl rounded-xl border-2 border-gray-300 text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={addItem}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-2xl font-semibold"
            >
              Add to List
            </button>
            <button
              onClick={() => setScreen('menu')}
              className="w-full p-4 bg-gray-200 hover:bg-gray-300 rounded-xl text-xl font-semibold text-gray-800"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

    {screen === 'list' && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Ration List</h1>
          <div className="space-y-4">
            {items && items.length > 0 ? (
              <>
                {items.map(item => (
                  <div
                    key={item.id}
                    className="p-6 bg-white rounded-xl shadow-md border-2 border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        {item.quantity && (
                          <div className="text-lg text-gray-800 mb-2">
                            Quantity: <span className="font-medium">{item.quantity}</span>
                          </div>
                        )}
                        <div className="text-base text-gray-700">
                          Added by <span className="font-medium">{item.added_by}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="w-full p-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 
                    text-white rounded-xl text-xl font-semibold flex items-center 
                    justify-center gap-2 transition-colors"
                >
                  <Trash2 size={24} />
                  {isDeleting ? 'Clearing...' : 'Clear List'}
                </button>
              </>
            ) : (
              <div className="text-center text-xl font-semibold text-gray-800 bg-white p-8 rounded-xl border-2 border-gray-200">
                No items in the list
              </div>
            )}
            <button
              onClick={() => setScreen('menu')}
              className="w-full p-4 bg-gray-200 hover:bg-gray-300 rounded-xl text-xl font-semibold text-gray-800"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={clearList}
      />
    </div>
  )
}