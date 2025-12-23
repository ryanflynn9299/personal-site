/**
 * A* Pathfinding Algorithm for Vertex Graph Navigation
 * 
 * Finds the shortest path between two vertices in the graph
 * using the A* algorithm with Euclidean distance as heuristic.
 */

import type { Vertex, VertexGraph, Edge } from "./vertexGraph";
import { isVertexInActiveTile } from "./vertexGraph";

/**
 * Node in the A* search tree
 */
interface AStarNode {
  vertexId: string;
  g: number; // Cost from start to this node
  h: number; // Heuristic estimate from this node to goal
  f: number; // Total cost (g + h)
  parent: AStarNode | null;
}

/**
 * Calculate Euclidean distance between two vertices (heuristic)
 */
function heuristic(v1: Vertex, v2: Vertex): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Reconstruct the path from the goal node back to the start
 */
function reconstructPath(node: AStarNode): string[] {
  const path: string[] = [];
  let current: AStarNode | null = node;
  
  while (current !== null) {
    path.unshift(current.vertexId);
    current = current.parent;
  }
  
  return path;
}

/**
 * Find the shortest path from start vertex to goal vertex using A* algorithm
 * 
 * @param graph The vertex graph
 * @param startId ID of the starting vertex
 * @param goalId ID of the goal vertex
 * @returns Array of vertex IDs representing the path, or null if no path exists
 */
export function findPath(
  graph: VertexGraph,
  startId: string,
  goalId: string
): string[] | null {
  const startVertex = graph.vertices.get(startId);
  const goalVertex = graph.vertices.get(goalId);
  
  if (!startVertex || !goalVertex) {
    return null;
  }
  
  // If start and goal are the same, return trivial path
  if (startId === goalId) {
    return [startId];
  }
  
  // Initialize open set (vertices to explore) and closed set (explored vertices)
  const openSet = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  
  // Create start node
  const startNode: AStarNode = {
    vertexId: startId,
    g: 0,
    h: heuristic(startVertex, goalVertex),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.set(startId, startNode);
  
  // Safety limit to prevent infinite loops (should never be reached in practice)
  const MAX_ITERATIONS = graph.vertices.size * 2;
  let iterations = 0;
  
  // Main A* loop
  while (openSet.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    // Find node with lowest f score
    let current: AStarNode | null = null;
    let lowestF = Infinity;
    
    for (const node of openSet.values()) {
      if (node.f < lowestF) {
        lowestF = node.f;
        current = node;
      }
    }
    
    if (!current) break;
    
    // Move current from open to closed set
    openSet.delete(current.vertexId);
    closedSet.add(current.vertexId);
    
    // If we reached the goal, reconstruct and return path
    if (current.vertexId === goalId) {
      return reconstructPath(current);
    }
    
    // Explore neighbors
    const edges = graph.edges.get(current.vertexId) || [];
    const currentVertex = graph.vertices.get(current.vertexId)!;
    
    for (const edge of edges) {
      const neighborId = edge.to;
      
      // Skip if already explored
      if (closedSet.has(neighborId)) {
        continue;
      }
      
      const neighborVertex = graph.vertices.get(neighborId);
      if (!neighborVertex) continue;
      
      // Disallow edges between vertices that both belong to active tiles
      // This prevents paths from staying within active tiles
      const currentIsInActive = isVertexInActiveTile(graph, current.vertexId);
      const neighborIsInActive = isVertexInActiveTile(graph, neighborId);
      if (currentIsInActive && neighborIsInActive) {
        continue; // Skip this edge
      }
      
      // Calculate tentative g score
      const tentativeG = current.g + edge.distance;
      
      // Check if neighbor is in open set
      const existingNode = openSet.get(neighborId);
      
      if (!existingNode) {
        // New node - add to open set
        const neighborNode: AStarNode = {
          vertexId: neighborId,
          g: tentativeG,
          h: heuristic(neighborVertex, goalVertex),
          f: 0,
          parent: current,
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        openSet.set(neighborId, neighborNode);
      } else if (tentativeG < existingNode.g) {
        // Found a better path to this neighbor - update it
        existingNode.g = tentativeG;
        existingNode.f = existingNode.g + existingNode.h;
        existingNode.parent = current;
      }
    }
  }
  
  // No path found (or max iterations reached)
  return null;
}

/**
 * Convert a path of vertex IDs to an SVG path string
 */
export function pathToSVGPath(graph: VertexGraph, path: string[]): string {
  if (path.length === 0) return "";
  if (path.length === 1) {
    const vertex = graph.vertices.get(path[0]);
    if (!vertex) return "";
    return `M ${vertex.x} ${vertex.y}`;
  }
  
  const commands: string[] = [];
  
  for (let i = 0; i < path.length; i++) {
    const vertex = graph.vertices.get(path[i]);
    if (!vertex) continue;
    
    if (i === 0) {
      commands.push(`M ${vertex.x} ${vertex.y}`);
    } else {
      commands.push(`L ${vertex.x} ${vertex.y}`);
    }
  }
  
  return commands.join(" ");
}

