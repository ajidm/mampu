import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersClient from "@/components/UsersClient";
import type { EnrichedUser } from "@/lib/types";
import { computeActivitySignals } from "@/lib/api";

// Mock next/navigation
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/users",
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
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
  makeUser({ id: 1, name: "Alice Smith", email: "alice@example.com", pendingTodos: 3, completedTodos: 7, totalPosts: 8 }),
  makeUser({ id: 2, name: "Bob Jones", email: "bob@example.com", pendingTodos: 0, completedTodos: 5, totalPosts: 3 }),
  makeUser({ id: 3, name: "Charlie Brown", email: "charlie@example.com", pendingTodos: 7, completedTodos: 2, totalPosts: 12 }),
];

beforeEach(() => {
  mockReplace.mockClear();
  mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
});

describe("UsersClient", () => {
  it("renders all users with activity signals", () => {
    render(<UsersClient users={mockUsers} />);
    // getAllByText handles multiple matches (table + card both render each name)
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob Jones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Charlie Brown").length).toBeGreaterThan(0);
  });

  it("displays totalPosts, completedTodos, pendingTodos per user", () => {
    render(<UsersClient users={mockUsers} />);
    // Alice: 8 posts, 7 completed, 3 pending — values appear in rendered output
    const { container } = render(<UsersClient users={mockUsers} />);
    expect(container.textContent).toContain("8");
    expect(container.textContent).toContain("7");
    expect(container.textContent).toContain("3");
  });

  it("filters by name search", async () => {
    render(<UsersClient users={mockUsers} />);
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "Alice");
    expect(mockReplace).toHaveBeenCalled();
  });

  it("shows empty state when no users match search", () => {
    mockSearchParams.set("q", "zzznomatch");
    render(<UsersClient users={mockUsers} />);
    expect(
      screen.getByText(/no users match your current search or filter/i)
    ).toBeInTheDocument();
  });

  it("renders clear filters button in empty state when filter is active", () => {
    mockSearchParams.set("q", "zzznomatch");
    render(<UsersClient users={mockUsers} />);
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  it("filters by has-pending filter", () => {
    mockSearchParams.set("filter", "has-pending");
    render(<UsersClient users={mockUsers} />);
    // Bob has 0 pending — should not appear
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    // Alice and Charlie have pending todos — each appears twice (table + cards, both rendered)
    expect(screen.getAllByText("Alice Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Charlie Brown").length).toBeGreaterThan(0);
  });

  it("filters by no-completed filter", () => {
    mockSearchParams.set("filter", "no-completed");
    render(<UsersClient users={mockUsers} />);
    // Only users with completedTodos === 0 should appear; none in this set
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

  it("sorts by name descending via URL param (triggered by table header click)", () => {
    mockSearchParams.set("sort", "name-desc");
    render(<UsersClient users={mockUsers} />);
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = [...new Set(links.map((l) => l.getAttribute("aria-label")?.replace("View details for ", "")))];
    expect(uniqueNames[0]).toBe("Charlie Brown");
  });

  it("sorts by most pending todos via URL param (triggered by table header click)", () => {
    mockSearchParams.set("sort", "pending-desc");
    render(<UsersClient users={mockUsers} />);
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = [...new Set(links.map((l) => l.getAttribute("aria-label")?.replace("View details for ", "")))];
    // Charlie has 7 pending → first
    expect(uniqueNames[0]).toBe("Charlie Brown");
  });

  it("shows loading-safe empty state when users array is empty", () => {
    render(<UsersClient users={[]} />);
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("paginates: shows at most 10 unique users per page", () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) =>
      makeUser({ id: i + 1, name: `User ${String(i + 1).padStart(2, "0")}`, email: `user${i + 1}@example.com` })
    );
    render(<UsersClient users={manyUsers} />);
    // Each user has an aria-label "View details for User XX" in both table and card
    const links = screen.getAllByRole("link", { name: /^View details for/ });
    const uniqueNames = new Set(links.map((l) => l.getAttribute("aria-label")));
    expect(uniqueNames.size).toBe(10);
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
    const result = computeActivitySignals(
      [makeUser({ id: 99 })],
      [],
      []
    );
    expect(result[0].totalPosts).toBe(0);
    expect(result[0].completedTodos).toBe(0);
    expect(result[0].pendingTodos).toBe(0);
  });
});
