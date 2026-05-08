import type { Todo } from "@/lib/types";

interface Props {
  todos: Todo[];
}

export default function TodosList({ todos }: Props) {
  if (todos.length === 0) {
    return (
      <section aria-label="Todos">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Todos</h2>
        <p className="text-sm text-gray-500">No todos yet.</p>
      </section>
    );
  }

  const completed = todos.filter((t) => t.completed).length;
  const pct = Math.round((completed / todos.length) * 100);

  return (
    <section aria-label="Todos">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        Todos{" "}
        <span className="text-gray-400">
          ({completed}/{todos.length} done)
        </span>
      </h2>

      <div className="mb-4">
        <progress
          value={completed}
          max={todos.length}
          aria-label="Todo completion"
          className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-green-500"
        />
        <p className="mt-1 text-xs text-gray-500">{pct}% complete</p>
      </div>

      <ul className="space-y-1.5" role="list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-start gap-2 text-sm"
            role="listitem"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 shrink-0 text-base ${
                todo.completed ? "text-green-500" : "text-gray-300"
              }`}
            >
              {todo.completed ? "✓" : "○"}
            </span>
            <span
              className={
                todo.completed ? "text-gray-400 line-through" : "text-gray-700"
              }
            >
              {todo.title}
            </span>
            <span className="sr-only">{todo.completed ? "(completed)" : "(pending)"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
