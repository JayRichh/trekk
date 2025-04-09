/**
 * MCP (Model Context Protocol) API integration
 * 
 * This module provides helper functions to interact with the MCP servers.
 */

// Type for the response from an MCP resource access
export interface McpResourceResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
}

// Type for the response from an MCP tool use
export interface McpToolResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
}

/**
 * Access a resource from an MCP server
 * @param server - The MCP server name
 * @param uri - The resource URI
 * @returns The parsed resource data
 */
export async function access_mcp_resource<T = any>(server: string, uri: string): Promise<T> {
  try {
    // In a real app, this would be implemented to call the MCP servers
    console.log(`Accessing MCP resource: ${server} - ${uri}`);
    
    // This is a mock implementation for local development
    // When the app is running with the actual MCP infrastructure,
    // this would be replaced with real API calls to the MCP backend
    
    if (server === 'doc-nz-server' && uri === 'doc-nz://regions') {
      // Simulate fetching regions
      return await simulateApiCall({
        id: 'northland',
        name: 'Northland',
        description: 'The northernmost region of New Zealand, featuring subtropical coastal trails.',
        trailCount: 22
      });
    }
    
    // Default return
    return null as any;
  } catch (error) {
    console.error('Error accessing MCP resource:', error);
    throw error;
  }
}

/**
 * Use a tool from an MCP server
 * @param server - The MCP server name
 * @param tool - The tool name
 * @param args - Arguments for the tool
 * @returns The parsed tool response data
 */
export async function use_mcp_tool<T = any>(
  server: string, 
  tool: string, 
  args: Record<string, any>
): Promise<T> {
  try {
    console.log(`Using MCP tool: ${server} - ${tool}`, args);
    
    // This is a mock implementation for local development
    
    // Simulate different tool responses based on the server and tool name
    if (server === 'doc-nz-server') {
      if (tool === 'fetch_trails') {
        return null as any; // Let's use the mock data to demonstrate the fallback mechanism
      }
      
      if (tool === 'search_trails') {
        const { query, limit } = args;
        // Simulate search - the actual result would come from the DOC NZ MCP server
        return await simulateApiCall([]);
      }
      
      if (tool === 'get_trail_details') {
        const { trailId } = args;
        // Simulate getting trail details
        return await simulateApiCall(null);
      }
    }
    
    if (server === 'mapbox-server') {
      if (tool === 'fetch_mapbox_examples') {
        const { category } = args;
        // Simulate fetching Mapbox examples
        return await simulateApiCall([
          { id: 'example1', title: 'Basic 3D Terrain', description: 'Shows how to add 3D terrain to a map.' },
          { id: 'example2', title: 'Hillshade Layer', description: 'Demonstrates using a hillshade layer for topographic visualization.' }
        ]);
      }
    }
    
    // Default return
    return null as any;
  } catch (error) {
    console.error('Error using MCP tool:', error);
    throw error;
  }
}

/**
 * Helper to simulate an async API call with mock data
 */
async function simulateApiCall<T>(mockData: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 300); // Simulate network delay
  });
}
