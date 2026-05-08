import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostsList from "@/components/PostsList";
import TodosList from "@/components/TodosList";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import type { Post, Todo } from "@/lib/types";

jest.mock("next/link", () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const mockPosts: Post[] = [
  { id: 1, userId: 1, title: "First post title", body: "First post body content here." },
  { id: 2, userId: 1, title: "Second post title", body: "Second post body content here." },
];

const mockTodos: Todo[] = [
  { id: 1, userId: 1, title: "Buy groceries", completed: true },
  { id: 2, userId: 1, title: "Write tests", completed: false },
  { id: 3, userId: 1, title: "Fix bug", completed: false },
];

describe("PostsList", () => {
  it("renders correct post count in heading", () => {
    render(<PostsList posts={mockPosts} />);
    expect(screen.getByText(/Posts/)).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("renders all post titles", () => {
    render(<PostsList posts={mockPosts} />);
    expect(screen.getByText("First post title")).toBeInTheDocument();
    expect(screen.getByText("Second post title")).toBeInTheDocument();
  });

  it("post body is initially hidden and visible after click", async () => {
    render(<PostsList posts={mockPosts} />);
    // The <details> element hides body until open
    const summary = screen.getByText("First post title");
    expect(screen.queryByText("First post body content here.")).not.toBeVisible();
    await userEvent.click(summary);
    expect(screen.getByText("First post body content here.")).toBeVisible();
  });

  it("shows empty state when posts array is empty", () => {
    render(<PostsList posts={[]} />);
    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
  });
});

describe("TodosList", () => {
  it("renders progress bar with correct value", () => {
    render(<TodosList todos={mockTodos} />);
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("value", "1");
    expect(progress).toHaveAttribute("max", "3");
  });

  it("renders completed todos with strikethrough class", () => {
    render(<TodosList todos={mockTodos} />);
    const completedItem = screen.getByText("Buy groceries");
    expect(completedItem).toHaveClass("line-through");
  });

  it("renders pending todos without strikethrough", () => {
    render(<TodosList todos={mockTodos} />);
    const pendingItem = screen.getByText("Write tests");
    expect(pendingItem).not.toHaveClass("line-through");
  });

  it("shows completion percentage", () => {
    render(<TodosList todos={mockTodos} />);
    expect(screen.getByText("33% complete")).toBeInTheDocument();
  });

  it("shows empty state when todos array is empty", () => {
    render(<TodosList todos={[]} />);
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });

  it("renders all todo titles", () => {
    render(<TodosList todos={mockTodos} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Fix bug")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders the given message", () => {
    render(<EmptyState message="Nothing here." />);
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const onAction = jest.fn();
    render(
      <EmptyState message="Empty" actionLabel="Reset" onAction={onAction} />
    );
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("calls onAction when button clicked", async () => {
    const onAction = jest.fn();
    render(
      <EmptyState message="Empty" actionLabel="Reset" onAction={onAction} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button when actionLabel is not provided", () => {
    render(<EmptyState message="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("ErrorAlert", () => {
  it("renders error message", () => {
    render(<ErrorAlert message="Something went wrong." />);
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("renders retry button when onRetry provided", () => {
    const onRetry = jest.fn();
    render(<ErrorAlert message="Error" onRetry={onRetry} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls onRetry when retry button clicked", async () => {
    const onRetry = jest.fn();
    render(<ErrorAlert message="Error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has role=alert for accessibility", () => {
    render(<ErrorAlert message="Error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
