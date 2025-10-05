import { account } from '@/appwrite/config';
import type { UserAuthResponse, ConnectionTestResponse } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Create JWT token for backend authentication
      const jwt = await account.createJWT();
      return {
        'Authorization': `Bearer ${jwt.jwt}`,  // Send JWT token
        'Content-Type': 'application/json',
      };
    } catch {
      throw new Error('Please sign in first');
    }
  }

  /**
   * Test backend connection (no auth required)
   */
  async testConnection(): Promise<ConnectionTestResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/test-connection`);
    
    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Get current user info (requires user authentication)
   */
  async getCurrentUser(): Promise<UserAuthResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to access this feature');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Execute a research job (requires user authentication)
   * Triggers the backend to start processing the job
   */
  async executeResearchJob(jobId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/research/execute/${jobId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to execute research jobs');
      }
      if (response.status === 404) {
        throw new Error('Research job not found');
      }
      throw new Error(`Research execution failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get research job status (requires user authentication)
   */
  async getResearchJobStatus(jobId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/research/status/${jobId}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to check job status');
      }
      throw new Error(`Status check failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create voice session (simplified - no research job required)
   */
  async createVoiceSession(data: {
    session_name: string;
  }) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/voice/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to create voice sessions');
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid session data');
      }
      throw new Error(`Voice session creation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get LiveKit connection token for a voice session
   */
  async getVoiceConnectionToken(sessionId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/voice/sessions/${sessionId}/token`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to get connection token');
      }
      if (response.status === 404) {
        throw new Error('Voice session not found');
      }
      throw new Error(`Failed to get connection token: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get voice sessions for current user
   */
  async getVoiceSessions(limit = 20, offset = 0) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/voice/sessions?limit=${limit}&offset=${offset}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to view voice sessions');
      }
      throw new Error(`Failed to fetch voice sessions: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get specific voice session details
   */
  async getVoiceSession(sessionId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/voice/session/${sessionId}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to view voice session');
      }
      if (response.status === 404) {
        throw new Error('Voice session not found or access denied');
      }
      throw new Error(`Failed to fetch voice session: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get session transcript
   */
  async getSessionTranscript(sessionId: string, download = false) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/voice/transcript/${sessionId}?download=${download}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to view transcript');
      }
      if (response.status === 404) {
        throw new Error('Transcript not available for this session');
      }
      throw new Error(`Failed to fetch transcript: ${response.status}`);
    }

    if (download) {
      return response.blob();
    }
    return response.json();
  }

  /**
   * @deprecated Legacy method - use Appwrite directly for job creation
   */
  async createResearchJob(query: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/research/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to create research jobs');
      }
      throw new Error(`Research failed: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new APIClient();