
// "use client";

// import { useChat } from "@ai-sdk/react";

// import { useRef, useEffect, useCallback } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { ChatInput } from "./ui/chat-input";
// import { EmptyState } from "./empty-state";
// import { LoadingIndicator } from "./ui/thinking";
// import { Message } from "./ai-message";
// import { useEditorId } from "@/hooks/use-editorId";



// interface AiChatProps {
//   id: string;
// }

// export default function AiChat({ id }: AiChatProps) {
//   const router = useRouter();
//   const params = useParams();
//   // const { editor } = useEditorContext();
//   const { triggerNavigation } = useEditorId(id);
//   const {
//     messages,
//     input,
//     handleInputChange,
//     isLoading,
//     append,
//     error,
//     stop,
//     setInput,
//   } = useChat({
//     id : `chat-${id}`,
//     onFinish(message) {
//       console.log("Chat finished:", message);
//     },
//   });

//   const messagesContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop =
//         messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages, isLoading]);

//   const handleFormSubmit = useCallback(
//     async (e: React.FormEvent<HTMLFormElement>) => {
//       e.preventDefault();
//       if (!input.trim()) return;

//       const messageToSend = {
//         role: "user" as const,
//         content: input,
//       };

//       append(messageToSend);
//       setInput("");
//       triggerNavigation();
//     },
//     [append, input, params.id, router, id]
//   );

//   return (
//     <div className="flex-1 flex flex-col h-full border shadow-sm bg-card rounded min-w-[350px]">
//       <div
//         ref={messagesContainerRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4"
//         style={{ minHeight: 0 }}
//       >
//         {messages.length === 0 ? (
//           <EmptyState />
//         ) : (
//           messages.map((message) => (
//             <Message key={message.id} message={message} />
//           ))
//         )}

//         {isLoading && messages[messages.length - 1]?.role === "user" && (
//           <LoadingIndicator />
//         )}
//       </div>

//       <form onSubmit={handleFormSubmit}>
//         <ChatInput
//           input={input}
//           isLoading={isLoading}
//           error={error}
//           handleInputChange={handleInputChange}
//           stop={stop}
//         />
//       </form>
//     </div>
//   );
// }
