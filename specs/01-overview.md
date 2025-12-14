# 01 — Overview

## High Concept
A top‑down 2D game where the player controls a **Scout Leader** guiding a small group of **Scouts** to set up a campsite in a dense forest. The core fantasy is organizing: **assigning work**, **clearing terrain**, and **building structures**.

## Theme
Scouting / outdoor camp setup: tent pitching, fire building, flag raising, teamwork.

## Target Platform
- Web (Phaser 3)
- Keyboard-first controls (gamepad optional later)

## Control Model (MVP)
- Player controls the leader only
- Scouts are commanded/automated (no direct scout control)

## Art Direction (MVP)
- Clean vector/cartoon (keep it simple; placeholders OK)

## MVP Scope
- One playable level: forest clearing with a **river**
- Leader movement + interaction
- 3 scouts starting in the clearing
- Tile-based environment with **tile collisions** (trees/rocks/water)
- A simple resource loop: **chop trees → gain wood → build huts**
- Path clearing: remove tree tiles to open routes
- Simple win state (all huts built)

## Out of Scope (for MVP)
- Multiple levels
- Complex pathfinding (grid/A*)
- Detailed inventory micromanagement (multiple item types)
- Dialogue trees
- Multiplayer

