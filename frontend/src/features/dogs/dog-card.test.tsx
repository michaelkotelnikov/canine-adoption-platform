import { render, screen } from "@testing-library/react";

import { DogCard } from "./dog-card";

describe("DogCard", () => {
  it("renders name breed age and status", () => {
    render(
      <DogCard
        dog={{
          id: 1,
          name: "Rex",
          breed: "Mix",
          age: 4,
          photo_url: "https://example.com/p.jpg",
          status: "available",
        }}
      />,
    );
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.getByText(/Mix/)).toBeInTheDocument();
    expect(screen.getByText("available")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/dogs/1");
  });
});
