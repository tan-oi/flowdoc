import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { LucideIcon } from 'lucide-react'

export interface SlashMenuItem {
  title: string
  searchTerms: string[]
  icon: LucideIcon
  command: (props: any) => void
}

interface SlashMenuProps {
  items: SlashMenuItem[]
  command: (item: SlashMenuItem) => void
}

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean
  updateProps: (props: any) => void
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [filteredItems, setFilteredItems] = useState(items)
    const containerRef = useRef<HTMLDivElement>(null)

    // Scroll selected item into view
    const scrollToSelected = (index: number) => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const selectedElement = container.children[index + 1] as HTMLElement // +1 because first child is the "Suggestions" label
      
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
        
        // Add some padding by scrolling a bit more
        const container = containerRef.current
        const elementRect = selectedElement.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        // If element is near the top, scroll up a bit more
        if (elementRect.top - containerRect.top < 40) {
          container.scrollTop -= 20
        }
        // If element is near the bottom, scroll down a bit more  
        else if (containerRect.bottom - elementRect.bottom < 40) {
          container.scrollTop += 20
        }
      }
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          const newIndex = selectedIndex === 0 ? filteredItems.length - 1 : selectedIndex - 1
          setSelectedIndex(newIndex)
          setTimeout(() => scrollToSelected(newIndex), 0) // Delay to ensure state update
          return true
        }

        if (event.key === 'ArrowDown') {
          const newIndex = selectedIndex === filteredItems.length - 1 ? 0 : selectedIndex + 1
          setSelectedIndex(newIndex)
          setTimeout(() => scrollToSelected(newIndex), 0) // Delay to ensure state update
          return true
        }

        if (event.key === 'Enter') {
          if (filteredItems[selectedIndex]) {
            command(filteredItems[selectedIndex])
          }
          return true
        }

        if (event.key === 'Escape') {
          return true
        }

        return false
      },
      updateProps: (props: any) => {
        const query = props.query?.toLowerCase() || ''
        
        const filtered = items.filter(item => {
          const titleMatch = item.title.toLowerCase().includes(query)
          const termsMatch = item.searchTerms.some(term => 
            term.toLowerCase().includes(query)
          )
          return titleMatch || termsMatch
        })

        setFilteredItems(filtered)
        setSelectedIndex(0)
      }
    }))

    return (
      <div 
        ref={containerRef}
        className="bg-neutral-900 px-4 rounded-lg min-w-[130px] max-h-64 overflow-y-auto overscroll-contain scrollbar-none py-2 border shadow-lg"
      >
        <p className="text-[10px] text-gray-400 font-semibold uppercase py-2 px-1">
          Suggestions
        </p>
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-center gap-2 p-1.5 text-sm font-medium select-none rounded-md cursor-pointer ${
                index === selectedIndex
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-700'
              }`}
              onClick={() => command(item)}
            >
              <item.icon size={16} />
              {item.title}
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 p-1.5 text-sm font-medium text-gray-500 select-none">
            No results found
          </div>
        )}
      </div>
    )
  }
)

SlashMenu.displayName = "slashMenu"