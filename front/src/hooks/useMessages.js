import { useMemo, useState } from 'react'

export function useMessages(conversations = []) {
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredConversations = useMemo(() => {
    if (!normalizedQuery) {
      return conversations
    }

    return conversations.filter((conversation) => {
      const haystack = `${conversation.name} ${conversation.preview}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [conversations, normalizedQuery])

  const selectedConversation = useMemo(
    () => filteredConversations.find((conversation) => conversation.id === selectedId) ?? null,
    [filteredConversations, selectedId]
  )

  const selectConversation = (conversationId) => {
    setSelectedId(conversationId)
  }

  const clearSelection = () => {
    setSelectedId(null)
  }

  return {
    selectedId,
    selectedConversation,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    selectConversation,
    clearSelection,
  }
}
