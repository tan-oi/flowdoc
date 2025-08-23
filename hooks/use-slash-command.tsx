// hooks/use-slash-command.tsx
import { useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { SlashMenu, SlashMenuItem, SlashMenuRef } from '../components/slash-menu'

export const useSlashCommand = (items: SlashMenuItem[]) => {
  const menuRef = useRef<SlashMenuRef>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<any>(null)

  const renderSlashMenu = () => ({
    onStart: (props: any) => {
      if (!props.clientRect) return

      // Create popup element
      const popup = document.createElement('div')
      popup.style.position = 'absolute'
      popup.style.zIndex = '1000'
      
      // Position the popup
      const rect = props.clientRect()
      popup.style.top = `${rect.bottom + 8}px`
      popup.style.left = `${rect.left}px`
      
      document.body.appendChild(popup)
      popupRef.current = popup

      // Create React root and render menu
      const root = createRoot(popup)
      rootRef.current = root

      root.render(
        <SlashMenu
          ref={menuRef}
          items={items}
          command={(item) => {
            props.command({ 
              editor: props.editor, 
              range: props.range,
              ...item
            })
          }}
        />
      )

      // Initial props update
      menuRef.current?.updateProps(props)
    },

    onUpdate: (props: any) => {
      // Update position
      if (popupRef.current && props.clientRect) {
        const rect = props.clientRect()
        popupRef.current.style.top = `${rect.bottom + 8}px`
        popupRef.current.style.left = `${rect.left}px`
      }

      // Update menu props
      menuRef.current?.updateProps(props)
    },

    onKeyDown: (props: any) => {
      return menuRef.current?.onKeyDown(props.event) || false
    },

    onExit: () => {
      // Cleanup
      if (rootRef.current) {
        rootRef.current.unmount()
        rootRef.current = null
      }

      if (popupRef.current) {
        document.body.removeChild(popupRef.current)
        popupRef.current = null
      }

      menuRef.current = null
    }
  })

  return {
    renderSlashMenu
  }
}