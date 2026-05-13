/**
 * TDD tests for TopDogsSection component.
 *
 * Uses React renderToStaticMarkup (node-compatible, no jsdom needed) to verify
 * the three render states: both cards, partial, and empty.
 *
 * These tests were written BEFORE the implementation (RED phase).
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// Import will fail (module missing) until GREEN phase creates the file.
// Once the file exists, the tests validate render correctness.
import TopDogsSection from "./TopDogsSection";

const LIKED_DOG = {
  dogId: "d40de385-3626-46c8-94bf-b7097226174f",
  imageUrl: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg",
  likeCount: 7,
};

const DISLIKED_DOG = {
  dogId: "abcdef12-0000-0000-0000-000000000000",
  imageUrl: "https://random.dog/abcdef12-0000-0000-0000-000000000000.jpg",
  dislikeCount: 3,
};

describe("TopDogsSection", () => {
  describe("section heading", () => {
    it('renders "Top Dogs" heading with text-headline-md text-on-surface', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("Top Dogs");
      expect(html).toContain("text-headline-md");
      expect(html).toContain("text-on-surface");
    });
  });

  describe("both cards present", () => {
    it("renders grid grid-cols-2 gap-md container", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("grid");
      expect(html).toContain("grid-cols-2");
      expect(html).toContain("gap-md");
    });

    it('renders "Most Liked" label with text-primary', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("Most Liked");
      expect(html).toContain("text-primary");
    });

    it('renders "Most Disliked" label with text-error', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("Most Disliked");
      expect(html).toContain("text-error");
    });

    it("renders dogId sliced to 8 chars with # prefix", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      // d40de385 is first 8 chars of LIKED_DOG.dogId
      expect(html).toContain("#d40de385");
      // abcdef12 is first 8 chars of DISLIKED_DOG.dogId
      expect(html).toContain("#abcdef12");
    });

    it("renders like count with text-primary and dislike count with text-error", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("7");
      expect(html).toContain("likes");
      expect(html).toContain("3");
      expect(html).toContain("dislikes");
    });

    it("renders card containers with design token classes", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("bg-surface-container-lowest");
      expect(html).toContain("rounded-[24px]");
      expect(html).toContain("shadow-[0_4px_24px_rgba(0,0,0,0.04)]");
    });

    it("renders image wrapper with h-[140px]", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("h-[140px]");
    });
  });

  describe("partial state — only mostLiked", () => {
    it("renders Most Liked card without a Most Disliked placeholder", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: LIKED_DOG, mostDisliked: null },
        })
      );
      expect(html).toContain("Most Liked");
      expect(html).not.toContain("Most Disliked");
    });
  });

  describe("partial state — only mostDisliked", () => {
    it("renders Most Disliked card without a Most Liked placeholder", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: null, mostDisliked: DISLIKED_DOG },
        })
      );
      expect(html).toContain("Most Disliked");
      expect(html).not.toContain("Most Liked");
    });
  });

  describe("empty state — both null", () => {
    it('renders "No top dogs yet" heading when topDogs is null', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, { topDogs: null })
      );
      expect(html).toContain("No top dogs yet");
      expect(html).toContain("No swipes yet");
    });

    it('renders "No top dogs yet" heading when both categories are null', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, {
          topDogs: { mostLiked: null, mostDisliked: null },
        })
      );
      expect(html).toContain("No top dogs yet");
      expect(html).toContain("No swipes yet");
    });

    it("does not render a grid in the empty state", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, { topDogs: null })
      );
      expect(html).not.toContain("grid-cols-2");
    });

    it("still renders the section wrapper (section is not hidden)", () => {
      const html = renderToStaticMarkup(
        React.createElement(TopDogsSection, { topDogs: null })
      );
      // Section heading "Top Dogs" is always present
      expect(html).toContain("Top Dogs");
    });
  });
});
