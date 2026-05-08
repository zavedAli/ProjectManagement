# TanStack Query v5 Patterns Demonstrated

This codebase demonstrates production-grade React Query v5 patterns.

## 1. QueryClient Configuration (`src/lib/queryClient.ts`)

**Pattern**: Centralized configuration with error handling

```typescript
- staleTime: 2 minutes (data considered fresh)
- gcTime: 10 minutes (cache retention after unmount)
- Smart retry logic (skip 401/403/404)
- Global error handlers via QueryCache/MutationCache
```

**Why**: Prevents redundant requests, handles auth failures gracefully, provides consistent UX.

**Tradeoffs**: Higher staleTime = less fresh data but fewer requests. Balance based on data volatility.

---

## 2. Query Key Factory (`src/queryKeys/index.ts`)

**Pattern**: Hierarchical, type-safe query keys

```typescript
queryKeys.tasks.all(projectId)      // ['tasks', projectId]
queryKeys.tasks.detail(id)          // ['tasks', 'detail', id]
```

**Why**: 
- Prevents typos
- Enables precise invalidation
- Auto-completion in IDE
- Easy to refactor

**Invalidation Strategy**:
```typescript
// Invalidate all tasks for a project
invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) })

// Invalidate all task-related queries
invalidateQueries({ queryKey: ['tasks'] })
```

---

## 3. Basic Query with Conditional Fetching (`hooks/useProjects.ts`)

**Pattern**: `enabled` option prevents premature fetching

```typescript
useQuery({
  queryKey: queryKeys.projects.all(workspaceId),
  queryFn: ({ signal }) => projectApi.getAll(workspaceId, signal),
  enabled: !!workspaceId,  // Don't fetch until workspaceId exists
})
```

**Why**: Avoids 400 errors when dependencies aren't ready yet.

**Signal**: Automatic request cancellation when component unmounts or query key changes.

---

## 4. Optimistic Updates with Rollback (`hooks/useProjects.ts`)

**Pattern**: Update UI immediately, rollback on error

```typescript
onMutate: async (newProject) => {
  await qc.cancelQueries({ queryKey: ... });  // Cancel in-flight requests
  const previous = qc.getQueryData(...);       // Snapshot current state
  qc.setQueryData(..., (old) => [...]);        // Optimistic update
  return { previous };                         // Context for rollback
},
onError: (_err, _vars, context) => {
  qc.setQueryData(..., context.previous);      // Rollback
},
onSettled: () => {
  qc.invalidateQueries(...);                   // Sync with server
}
```

**Why**: Instant feedback, feels native. Rollback ensures consistency on failure.

**Cache Implications**: Temporary inconsistency between cache and server until `onSettled` refetches.

---

## 5. Placeholder Data (`hooks/useProjects.ts`)

**Pattern**: Keep old data visible during refetch

```typescript
placeholderData: (prev) => prev
```

**Why**: Prevents layout shift during pagination or refetch. Replaces deprecated `keepPreviousData`.

**Tradeoffs**: User sees stale data briefly. Use loading indicators to show background refresh.

---

## 6. Prefetching on Hover (`hooks/useProjects.ts`)

**Pattern**: Preload data before navigation

```typescript
const prefetchProject = usePrefetchProject();

<Link onMouseEnter={() => prefetchProject(project.id)}>
```

**Why**: Instant navigation, no loading spinners.

**Scaling**: Only prefetch if `staleTime` hasn't expired. Avoid prefetching large datasets.

---

## 7. Dependent Queries

**Pattern**: Chain queries with `enabled`

```typescript
const task = useQuery({ queryKey: ['task', id], ... });
const comments = useQuery({
  queryKey: ['comments', id],
  enabled: !!task.data?.id,  // Wait for task to load
});
```

**Why**: Prevents fetching comments before task ID is known.

---

## 8. Parallel Queries (`useQueries`)

**Pattern**: Fetch multiple independent queries simultaneously

```typescript
const results = useQueries({
  queries: [
    { queryKey: ['stats'], queryFn: getStats },
    { queryKey: ['activity'], queryFn: getActivity },
  ],
});
```

**Why**: Faster than sequential fetches. All requests fire at once.

---

## 9. Polling (`hooks/useNotifications.ts`)

**Pattern**: Auto-refresh at intervals

```typescript
refetchInterval: 1000 * 30,              // Poll every 30s
refetchIntervalInBackground: false,      // Pause when tab hidden
```

**Why**: Real-time feel without WebSockets. Pausing in background saves bandwidth.

**Tradeoffs**: 30s delay vs server load. Use WebSockets for <5s latency requirements.

---

## 10. Manual Cache Updates (`hooks/useNotifications.ts`)

**Pattern**: Directly mutate cache for instant UI updates

```typescript
qc.setQueryData<Notification[]>(queryKeys.notifications.all(), (old = []) =>
  old.map((n) => (n.id === id ? { ...n, read: true } : n))
);
```

**Why**: Faster than refetch. Useful for simple transformations.

**When to Use**: Small, predictable changes (toggle, increment). Avoid for complex server logic.

---

## 11. Mutation State Tracking

**Pattern**: Access mutation status in UI

```typescript
const createTask = useCreateTask(projectId);

<button disabled={createTask.isPending}>
  {createTask.isPending ? 'Creating...' : 'Create'}
</button>

{createTask.error && <div>{createTask.error.message}</div>}
```

**Why**: Provides feedback, prevents double-submission.

---

## 12. Query Cancellation via AbortSignal

**Pattern**: Pass signal to API calls

```typescript
queryFn: ({ signal }) => apiClient.get('/tasks', { signal })
```

**Why**: Cancels in-flight requests when component unmounts or query key changes. Prevents memory leaks and race conditions.

---

## 13. Retry Strategies (`lib/queryClient.ts`)

**Pattern**: Custom retry logic

```typescript
retry: (failureCount, error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
}
```

**Why**: Don't retry auth failures or 404s. Retry network errors up to 2 times.

---

## 14. Token Refresh Flow (`api/client.ts`)

**Pattern**: Interceptor-based token refresh with request queuing

```typescript
- Detect 401 response
- Queue subsequent requests
- Refresh token
- Replay queued requests with new token
- Redirect to login if refresh fails
```

**Why**: Seamless re-authentication without user action.

**Scaling**: Works for concurrent requests. Single refresh call serves all queued requests.

---

## 15. React Query Devtools

**Pattern**: Visual cache inspector

```typescript
<ReactQueryDevtools initialIsOpen={false} />
```

**Why**: Debug stale queries, inspect cache, track refetches. Essential for development.

---

## 16. WebSocket Cache Sync (Planned - see Phase 4 docs)

**Pattern**: Invalidate cache on server events

```typescript
socket.on('task:updated', ({ projectId }) => {
  qc.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) });
});
```

**Why**: Multi-user sync. Other users' changes appear instantly.

**Tradeoffs**: Invalidation triggers refetch. For high-frequency updates, use `setQueryData` instead.

---

## 17. Offline-Aware Mutations (Planned)

**Pattern**: Queue mutations when offline

```typescript
useMutation({
  mutationFn: createTask,
  networkMode: 'offlineFirst',  // Queue if offline, fire when online
});
```

**Why**: Progressive Web App support. Mutations survive network loss.

---

## 18. Suspense-Ready Architecture (Planned)

**Pattern**: Use `useSuspenseQuery` for Suspense boundaries

```typescript
const { data } = useSuspenseQuery({
  queryKey: ['projects'],
  queryFn: getProjects,
});
// No need for isLoading check - Suspense handles it
```

**Why**: Cleaner components, centralized loading states.

---

## Key Takeaways

1. **Always use query key factory** - Prevents bugs, enables precise invalidation
2. **Optimistic updates for writes** - Instant UX, rollback on error
3. **Prefetch on hover** - Feels instant, minimal cost
4. **Conditional fetching with `enabled`** - Avoid premature requests
5. **AbortSignal everywhere** - Prevent race conditions
6. **Smart retry logic** - Don't retry auth failures
7. **Polling for real-time feel** - Pause in background
8. **Manual cache updates for simple changes** - Faster than refetch
9. **Devtools in development** - Essential for debugging

---

## Performance Considerations

- **staleTime**: Higher = fewer requests, but staler data
- **gcTime**: Higher = more memory, but faster back-navigation
- **Prefetching**: Improves UX but increases bandwidth
- **Polling**: Balance freshness vs server load
- **Optimistic updates**: Reduce perceived latency by 100-500ms

---

## Common Pitfalls

1. **Forgetting `enabled`** → 400 errors on mount
2. **Not canceling queries in `onMutate`** → Race conditions
3. **Skipping `onSettled`** → Cache diverges from server
4. **Over-invalidating** → Unnecessary refetches
5. **Under-invalidating** → Stale data
6. **Not using query key factory** → Typos, hard to refactor
7. **Ignoring AbortSignal** → Memory leaks

---

## Next Steps

1. Add infinite scroll with `useInfiniteQuery`
2. Implement WebSocket sync
3. Add offline support with `networkMode`
4. Migrate to Suspense with `useSuspenseQuery`
5. Add pagination with cursor-based fetching
6. Implement cross-tab sync with BroadcastChannel
