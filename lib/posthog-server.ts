
import PostHogClient from './posthog'

interface EventProperties {
 [key: string]: any
}

interface Analytics {
 track: (event: string, distinctId: string, properties?: EventProperties) => void
 trackError: (error: Error, distinctId: string, context?: Record<string, any>) => void
 flush: () => Promise<void>
}

export function createAnalytics(): Analytics {
 const posthog = PostHogClient()
 
 return {
   track: (event: string, distinctId: string, properties: EventProperties = {}) => {
     posthog.capture({ distinctId, event, properties })
   },
   
   trackError: (error: Error, distinctId: string, context: Record<string, any> = {}) => {
     posthog.capture({ 
       distinctId, 
       event: 'error_occurred',
       properties: {
         error_name: error.name,
         error_message: error.message,
         error_stack: error.stack,
         ...context
       }
     })
   },
   
   flush: () => posthog.shutdown()
 }
}