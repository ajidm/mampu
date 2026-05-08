import { render, screen } from "@testing-library/react";
import UserDetailPage from "@/app/users/[id]/page";
import { fetchUser, fetchUserPosts, fetchUserTodos } from "@/lib/api";
import type { User, Post, Todo } from "@/lib/types";

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

// notFound() throws a special error that Next.js catches; we replicate that here
// so tests can assert on it with .rejects.toThrow()
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw Object.assign(new Error("NEXT_NOT_FOUND"), { digest: "NEXT_NOT_FOUND" });
  }),
}));

jest.mock("@/lib/api", () => ({
  fetchUser: jest.fn(),
  fetchUserPosts: jest.fn(),
  fetchUserTodos: jest.fn(),
}));

// ─── fixtures ───────────────────────────────────────────────────────────────

const mockUser: User = {
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
};

const mockPosts: Post[] = [
  { id: 1, userId: 1, title: "sunt aut facere repellat", body: "quia et suscipit" },
  { id: 2, userId: 1, title: "qui est esse",             body: "est rerum tempore" },
];

const mockTodos: Todo[] = [
  { id: 1, userId: 1, title: "delectus aut autem",    completed: false },
  { id: 2, userId: 1, title: "quis ut nam facilis",   completed: true  },
];

// ─── helpers ────────────────────────────────────────────────────────────────

/** Render the page for the given id string and return RTL queries. */
async function renderPage(id: string) {
  const jsx = await UserDetailPage({ params: Promise.resolve({ id }) });
  return render(jsx);
}

// ─── setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (fetchUser      as jest.Mock).mockResolvedValue(mockUser);
  (fetchUserPosts as jest.Mock).mockResolvedValue(mockPosts);
  (fetchUserTodos as jest.Mock).mockResolvedValue(mockTodos);
});

// ─── invalid id ─────────────────────────────────────────────────────────────

describe("UserDetailPage — invalid id", () => {
  it("calls notFound for a non-numeric id", async () => {
    await expect(renderPage("abc")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchUser).not.toHaveBeenCalled();
  });

  it("calls notFound for id = 0", async () => {
    await expect(renderPage("0")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchUser).not.toHaveBeenCalled();
  });

  it("calls notFound for a negative id", async () => {
    await expect(renderPage("-3")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchUser).not.toHaveBeenCalled();
  });
});

// ─── missing user ────────────────────────────────────────────────────────────

describe("UserDetailPage — missing user", () => {
  it("calls notFound when fetchUser returns null", async () => {
    (fetchUser as jest.Mock).mockResolvedValue(null);
    await expect(renderPage("999")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchUser).toHaveBeenCalledWith(999);
  });

  it("propagates fetch errors so the error boundary can handle them", async () => {
    (fetchUserPosts as jest.Mock).mockRejectedValue(new Error("Network error"));
    await expect(renderPage("1")).rejects.toThrow("Network error");
  });
});

// ─── successful render ───────────────────────────────────────────────────────

describe("UserDetailPage — renders profile", () => {
  it("renders all contact fields", async () => {
    await renderPage("1");
    expect(screen.getByText("Leanne Graham")).toBeInTheDocument();
    expect(screen.getByText("@Bret")).toBeInTheDocument();
    expect(screen.getByText("sincere@april.biz")).toBeInTheDocument();
    expect(screen.getByText("1-770-736-0988")).toBeInTheDocument();
    expect(screen.getByText("hildegard.org")).toBeInTheDocument();
  });

  it("renders company information", async () => {
    await renderPage("1");
    expect(screen.getByText("Romaguera-Crona")).toBeInTheDocument();
    expect(screen.getByText(/Multi-layered client-server neural-net/)).toBeInTheDocument();
  });

  it("renders address information", async () => {
    await renderPage("1");
    expect(screen.getByText(/Kulas Light/)).toBeInTheDocument();
    expect(screen.getByText(/Gwenborough/)).toBeInTheDocument();
    expect(screen.getByText(/92998-3874/)).toBeInTheDocument();
  });

  it("renders the posts section with fetched posts", async () => {
    await renderPage("1");
    expect(screen.getByRole("region", { name: "Posts" })).toBeInTheDocument();
    expect(screen.getByText("sunt aut facere repellat")).toBeInTheDocument();
    expect(screen.getByText("qui est esse")).toBeInTheDocument();
  });

  it("renders the todos section with fetched todos", async () => {
    await renderPage("1");
    expect(screen.getByRole("region", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByText("delectus aut autem")).toBeInTheDocument();
    expect(screen.getByText("quis ut nam facilis")).toBeInTheDocument();
  });

  it("includes a Back to list link pointing to /users", async () => {
    await renderPage("1");
    expect(
      screen.getByRole("link", { name: /back to list/i })
    ).toHaveAttribute("href", "/users");
  });

  it("fetches user, posts, and todos using the correct numeric id", async () => {
    await renderPage("1");
    expect(fetchUser).toHaveBeenCalledWith(1);
    expect(fetchUserPosts).toHaveBeenCalledWith(1);
    expect(fetchUserTodos).toHaveBeenCalledWith(1);
  });
});
