"""
Research Prompt Templates
Based on the Perplexity-style deep research approach from the notebook
"""

# Task Delegation Prompt - Lead Agent breaks down research into subtasks
DELEGATION_PROMPT = """You are a Lead Research Agent. Break down this complex query into 3 specialized subtasks for parallel execution: "{query}"

Context:
- Target: {target}
- Enabled Agents: {enabled_agents}
- Additional Context: {additional_context}

For each subtask, provide:
- Clear objective
- Specific search focus
- Expected output

SUBTASK 1: [Core/foundational aspects]
SUBTASK 2: [Recent developments/trends]
SUBTASK 3: [Applications/implications]

Make each subtask distinct to avoid overlap."""


# Follow-up Query Generation - Identifies gaps in research
FOLLOW_UP_PROMPT = """Research query: {query}

Sources:
{sources}

Based on these sources, what's the most important follow-up question that would deepen our understanding of "{query}"?

Respond with just a specific search query (no explanation):"""


# Feedback Loop Prompt - Identifies missing information
FEEDBACK_LOOP_PROMPT = """Review these research findings:

{findings}

Identify gaps or missing information:
1. What critical information is missing?
2. Are there any contradictions that need verification?
3. What follow-up searches would enhance quality?

Respond with 2-3 specific follow-up search queries, or "NONE" if complete."""


# Company Analysis Prompt
COMPANY_ANALYSIS_PROMPT = """Research query: {query}

Sources:
{sources}

Based on these sources, provide a comprehensive company analysis:

SUMMARY: [2-3 sentences covering key company information]

INSIGHTS:
- [Key insight about business model]
- [Key insight about products/services]
- [Key insight about market position]
- [Key insight about recent developments]

Format your response exactly as shown above."""


# Person Research Prompt - Extract profile information
PERSON_PROFILE_PROMPT = """Research query: Person profile for {person_name}

Sources:
{sources}

Extract and summarize the following about {person_name}:

BACKGROUND: [Education, career history, key achievements]

CURRENT ROLE: [Current position, company, responsibilities]

EXPERTISE: [Key areas of expertise and specialization]

RECENT ACTIVITY: [Recent posts, articles, projects, or public presence]

Keep each section concise (2-3 sentences max)."""


# Talking Points Generation Prompt
TALKING_POINTS_PROMPT = """Based on this person profile:

{person_profile}

Generate 5-7 specific talking points for a conversation with {person_name}:

TALKING POINTS:
1. [Specific topic related to their recent work]
2. [Question about their expertise area]
3. [Reference to their company/project]
4. [Industry trend they might have insights on]
5. [Personal achievement or milestone to acknowledge]

Make each point specific, actionable, and based on the research."""


# Final Synthesis Prompt - Combines all findings
SYNTHESIS_PROMPT = """Research query: {query}
Follow-up: {follow_up_query}

All Sources:
{all_sources}

Provide a comprehensive analysis:

SUMMARY: [3-4 sentences covering key findings from both research layers]

INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]
- [insight 4]

DEPTH GAINED: [1 sentence on how the follow-up search enhanced understanding]"""


# Multi-Agent Synthesis Prompt - Combines parallel agent findings
MULTI_AGENT_SYNTHESIS_PROMPT = """ORIGINAL QUERY: {query}

SUBAGENT FINDINGS:
{subagent_findings}

As the Lead Agent, synthesize these parallel findings into a comprehensive report:

EXECUTIVE SUMMARY:
[2-3 sentences covering the most important insights across all subagents]

INTEGRATED FINDINGS:
• [Key finding from foundational research]
• [Key finding from recent developments]
• [Key finding from applications research]
• [Cross-cutting insight that emerged]

RESEARCH QUALITY:
- Sources analyzed: {total_sources} across {num_agents} specialized agents
- Coverage: [How well the subtasks covered the topic]"""


# Market Analysis Prompt
MARKET_ANALYSIS_PROMPT = """Research query: Market analysis for {target}

Sources:
{sources}

Provide market analysis:

MARKET SIZE: [Current market size and growth projections]

KEY TRENDS: [3-4 major trends shaping the market]

OPPORTUNITIES: [Key opportunities identified]

CHALLENGES: [Main challenges and risks]"""


# Competitor Analysis Prompt
COMPETITOR_ANALYSIS_PROMPT = """Research query: Competitor analysis for {target}

Sources:
{sources}

Provide competitor analysis:

MAIN COMPETITORS: [List 3-5 main competitors]

COMPETITIVE POSITIONING: [How {target} compares to competitors]

DIFFERENTIATORS: [What sets {target} apart]

COMPETITIVE THREATS: [Key competitive challenges]"""


def format_sources_for_prompt(sources: list, max_sources: int = 4, max_chars_per_source: int = 400) -> str:
    """
    Format sources into a string for inclusion in prompts
    
    Args:
        sources: List of source dicts with title and content
        max_sources: Maximum number of sources to include
        max_chars_per_source: Maximum characters per source
        
    Returns:
        Formatted string of sources
    """
    formatted = ""
    for i, source in enumerate(sources[:max_sources], 1):
        title = source.get('title', 'Unknown')
        content = source.get('content', '')[:max_chars_per_source]
        formatted += f"{i}. {title}: {content}...\n\n"
    return formatted
