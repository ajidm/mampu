import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersClient from "@/components/UsersClient";
import type { EnrichedUser } from "@/lib/types";
import { computeActivitySignals } from "@/lib/api";

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const makeUser = (overrides: Partial<EnrichedUser> = {}): EnrichedUser => ({
  id: 1,
  name: "Leanne Graham",
  username: "Bret",
  email: "sincere@april.biz",
  phone: "1-770-736-0988",
  website: "hildegard.org",
  address: {
    street: "Kulas Light",
    suite: "Apt. 556",
    city: "Gwenborough",
    zipcode: "92998-3874",
    geo: { lat: "-37.3159", lng: "81.1496" },
  },
  company: {
    name: "Romaguera-Crona",
    catchPhrase: "Multi-layered client-server neural-net",
    bs: "harness real-time e-markets",
  },
  totalPosts: 10,
  completedTodos: 5,
  pendingTodos: 5,
  ...overrides,
});

const mockUsers: EnrichedUser[] = [
  makeUser({ id: 1, name: "Alice Smith",   email: "alice@example.com",   pendingTodos: 3, completedTodos: 7, totalPosts: 8  }),
  makeUser({ id: 2, name: "Bob Jones",     email: "bob@example.com",     pendingTodos: 0, completedTodos: 5, totalPosts: 3  }),
  makeUser({ id: 3, name: "Charlie Brown", email: "charlie@example.com", pendingTodos: 7, completedTodos: 2, totalPosts: 12 }),
];

const STORAGE_KEY = "mampu:users-state";

function mockNavType(type: "navigate" | "reload" | "back_forward") {
  Object.defineProperty(global, "performance", {
    configurable: true,
    value: {
      getEntriesByType: (entryType: string) =>
        entryType === "navigation" ? [{ type }] : [],
    },
  });
}

beforeEach(() => {
  sessionStorage.clear();
  mockNavType("navigate");
});

describe("UsersClient", () => {
  it("renders all users with activity signals", () => {
    render(<UsersClient users={mockUsers} />);
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob Jones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Charlie Brown").length).toBeGreaterThan(0);
  });

  it("displays totalPosts, completedTodos, pendingTodos per user", () => {
    const { container } = render(<UsersClient users={mockUsers} />);
    // Alice: 8 posts, 7 completed, 3 pending
    expect(container.textContent).toContain("8");
    expect(container.textContent).toContain("7");
    expect(container.textContent).toContain("3");
  });

  it("filters list by name search", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.type(screen.getByRole("searchbox"), "Alice");
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie Brown")).not.toBeInTheDocument();
  });

  it("filters list by email search", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.type(screen.getByRole("searchbox"), "bob@");
    expect(screen.getAllByText("Bob Jones").length).toBeGreaterThan(0);
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("shows empty state when no users match search", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.type(screen.getByRole("searchbox"), "zzznomatch");
    expect(screen.getByText(/no users match your current search or filter/i)).toBeInTheDocument();
  });

  it("renders clear filters button in empty state when filter is active", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.type(screen.getByRole("searchbox"), "zzznomatch");
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  it("filters by has-pending via Pending dropdown", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.selectOptions(screen.getByLabelText("Pending"), "has-pending");
    // Bob has 0 pending — should not appear
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Charlie Brown").length).toBeGreaterThan(0);
  });

  it("filters by no-completed via Completed dropdown — shows empty state", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.selectOptions(screen.getByLabelText("Completed"), "no-completed");
    // All mock users have completedTodos > 0 — none pass
    expect(screen.getByText(/no users match/i)).toBeInTheDocument();
  });

  it("filters by has-posts via Posts dropdown", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.selectOptions(screen.getByLabelText("Posts"), "has-posts");
    // All mock users have posts
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob Jones").length).toBeGreaterThan(0);
  });

  it("filters by no-posts via Posts dropdown — shows empty state", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.selectOptions(screen.getByLabelText("Posts"), "no-posts");
    expect(screen.getByText(/no users match/i)).toBeInTheDocument();
  });

  it("sorts by name ascending by default", () => {
    render(<UsersClient users={mockUsers} />);
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = [...new Set(links.map((l) => l.getAttribute("aria-label")?.replace("View details for ", "")))];
    expect(uniqueNames[0]).toBe("Alice Smith");
    expect(uniqueNames[1]).toBe("Bob Jones");
    expect(uniqueNames[2]).toBe("Charlie Brown");
  });

  it("sorts by name descending after clicking Name header once", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.click(screen.getByRole("button", { name: /name/i }));
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = [...new Set(links.map((l) => l.getAttribute("aria-label")?.replace("View details for ", "")))];
    expect(uniqueNames[0]).toBe("Charlie Brown");
  });

  it("sorts by most pending after clicking Pending header", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.click(screen.getByRole("button", { name: /pending/i }));
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = [...new Set(links.map((l) => l.getAttribute("aria-label")?.replace("View details for ", "")))];
    expect(uniqueNames[0]).toBe("Charlie Brown");
  });

  it("shows empty state when users array is empty", () => {
    render(<UsersClient users={[]} />);
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("paginates: shows at most 10 unique users per page by default", () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) =>
      makeUser({ id: i + 1, name: `User ${String(i + 1).padStart(2, "0")}`, email: `user${i + 1}@example.com` })
    );
    render(<UsersClient users={manyUsers} />);
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = new Set(links.map((l) => l.getAttribute("aria-label")));
    expect(uniqueNames.size).toBe(10);
  });

  it("restores filter state from sessionStorage on back-navigation", async () => {
    mockNavType("back_forward");
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ filterPending: "has-pending" })
    );
    render(<UsersClient users={mockUsers} />);
    // After useEffect restores state, Bob (0 pending) should not appear
    await waitFor(() => {
      expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    });
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
  });

  it("resets filter state on browser refresh (reload navigation)", async () => {
    mockNavType("reload");
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ filterPending: "has-pending" })
    );
    render(<UsersClient users={mockUsers} />);
    // All users should appear because saved state is discarded on reload
    await waitFor(() => {
      expect(screen.getAllByText("Bob Jones").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Charlie Brown").length).toBeGreaterThan(0);
  });

  it("persists filter state to sessionStorage on change", async () => {
    render(<UsersClient users={mockUsers} />);
    await userEvent.selectOptions(screen.getByLabelText("Pending"), "has-pending");
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.filterPending).toBe("has-pending");
  });
});

describe("computeActivitySignals", () => {
  const users = [
    makeUser({ id: 1, totalPosts: 0, completedTodos: 0, pendingTodos: 0 }),
    makeUser({ id: 2, totalPosts: 0, completedTodos: 0, pendingTodos: 0 }),
  ];
  const posts = [
    { id: 1, userId: 1, title: "Post A", body: "body" },
    { id: 2, userId: 1, title: "Post B", body: "body" },
    { id: 3, userId: 2, title: "Post C", body: "body" },
  ];
  const todos = [
    { id: 1, userId: 1, title: "Todo A", completed: true },
    { id: 2, userId: 1, title: "Todo B", completed: false },
    { id: 3, userId: 2, title: "Todo C", completed: true },
  ];

  it("computes correct totalPosts per user", () => {
    const result = computeActivitySignals(users, posts, todos);
    expect(result[0].totalPosts).toBe(2);
    expect(result[1].totalPosts).toBe(1);
  });

  it("computes correct completedTodos per user", () => {
    const result = computeActivitySignals(users, posts, todos);
    expect(result[0].completedTodos).toBe(1);
    expect(result[1].completedTodos).toBe(1);
  });

  it("computes correct pendingTodos per user", () => {
    const result = computeActivitySignals(users, posts, todos);
    expect(result[0].pendingTodos).toBe(1);
    expect(result[1].pendingTodos).toBe(0);
  });

  it("handles user with zero posts and todos", () => {
    const result = computeActivitySignals([makeUser({ id: 99 })], [], []);
    expect(result[0].totalPosts).toBe(0);
    expect(result[0].completedTodos).toBe(0);
    expect(result[0].pendingTodos).toBe(0);
  });
});
