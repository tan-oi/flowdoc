"use client"
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { Dot } from 'lucide-react'
import React, { memo, useCallback, useEffect, useRef } from 'react'

const ComponentView = memo((props) => {
  const intervalRef = useRef(null)

  const increase = useCallback(() => {
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    })
  }, [props.node.attrs.count, props.updateAttributes])

  // Auto-increment every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      props.updateAttributes({
        count: props.node.attrs.count + 1,
      })
    }, 5000)

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [props.node.attrs.count, props.updateAttributes])

  return (
   
      <NodeViewWrapper className="react-component relative my-1 py-0.5">
        <div className="border border-gray-200 rounded p-2 ">
          <Dot className='animate-ping text-green-500'/>
          <label>React Component</label>
          <div className="content">
            <button onClick={increase}>
              This button has been clicked {props.node.attrs.count} times.
            </button>
            <p className="text-xs text-gray-600 mt-1">
              Auto-increments every 5 seconds
            </p>
          </div>
        </div>
      </NodeViewWrapper>

  )
}, (prevProps, nextProps) => {
  // Only re-render if count actually changed
  return prevProps.node.attrs.count === nextProps.node.attrs.count
})

export default ComponentView