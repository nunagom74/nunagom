
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    id: string // productId
    title: string
    price: number
    image: string
    quantity: number
    maxStock?: number
    shippingFee?: number
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void

    // UI Actions
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                const currentItems = get().items
                const existingItem = currentItems.find((i) => i.id === item.id)

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                        isOpen: true, // Auto open when adding
                    })
                } else {
                    set({ items: [...currentItems, item], isOpen: true })
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) })
            },

            updateQuantity: (id, quantity) => {
                const item = get().items.find(i => i.id === id)
                if (quantity <= 0) {
                    get().removeItem(id)
                } else if (item && item.maxStock && quantity > item.maxStock) {
                    // Don't exceed stock if known
                    return
                } else {
                    set({
                        items: get().items.map((i) =>
                            i.id === id ? { ...i, quantity } : i
                        ),
                    })
                }
            },

            clearCart: () => set({ items: [] }),

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set({ isOpen: !get().isOpen }),
        }),
        {
            name: 'nuna-gom-cart',
            storage: createJSONStorage(() => localStorage),
            // Only persist items, not UI state like isOpen
            partialize: (state) => ({ items: state.items }),
        }
    )
)
