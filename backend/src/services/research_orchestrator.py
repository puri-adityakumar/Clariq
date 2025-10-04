"""
Research Orchestrator - Multi-Agent Research System
Coordinates specialized agents to perform comprehensive market research
Based on Anthropic's multi-agent approach and Perplexity-style deep research
"""
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from services.exa_service import get_exa_service
from services.cerebras_service import get_cerebras_service
from prompts.research_prompts import (
    DELEGATION_PROMPT,
    FEEDBACK_LOOP_PROMPT,
    COMPANY_ANALYSIS_PROMPT,
    PERSON_PROFILE_PROMPT,
    TALKING_POINTS_PROMPT,
    MARKET_ANALYSIS_PROMPT,
    COMPETITOR_ANALYSIS_PROMPT,
    MULTI_AGENT_SYNTHESIS_PROMPT,
    format_sources_for_prompt
)

logger = logging.getLogger(__name__)


class ResearchOrchestrator:
    """
    Orchestrates multi-agent research execution.
    Coordinates specialized agents and synthesizes findings into comprehensive reports.
    """
    
    def __init__(self):
        self.exa = get_exa_service()
        self.cerebras = get_cerebras_service()
        logger.info("Research Orchestrator initialized")
    
    async def run_multi_agent_research(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute multi-agent research for a given job.
        
        Args:
            job_data: Research job data including target, enabled_agents, etc.
            
        Returns:
            Dict containing markdown_report, source_count, and metadata
        """
        start_time = datetime.utcnow()
        logger.info(f"Starting multi-agent research for target: {job_data.get('target')}")
        
        try:
            # Extract job parameters
            target = job_data.get('target', '')
            enabled_agents = job_data.get('enabled_agents', ['company_discovery'])
            person_name = job_data.get('person_name')
            person_linkedin = job_data.get('person_linkedin')
            additional_context = job_data.get('additional_context', '')
            
            # Step 1: Task Decomposition by Lead Agent
            logger.info("Step 1: Lead Agent - Task Decomposition")
            subtasks = await self._decompose_tasks(target, enabled_agents, additional_context)
            
            # Step 2: Execute Sub-Agents in Parallel
            logger.info("Step 2: Executing Sub-Agents")
            subagent_results = await self._execute_subagents(
                target=target,
                enabled_agents=enabled_agents,
                person_name=person_name,
                person_linkedin=person_linkedin,
                additional_context=additional_context
            )
            
            # Step 3: Feedback Loop - Identify Gaps
            logger.info("Step 3: Feedback Loop - Gap Analysis")
            follow_up_results = await self._feedback_loop(target, subagent_results)
            
            # Merge follow-up results
            if follow_up_results:
                subagent_results['follow_up'] = follow_up_results
            
            # Step 4: Final Synthesis
            logger.info("Step 4: Final Synthesis")
            synthesis = await self._synthesize_findings(
                target=target,
                subagent_results=subagent_results,
                enabled_agents=enabled_agents
            )
            
            # Step 5: Format Report
            logger.info("Step 5: Formatting Report")
            from utils.report_formatter import format_research_report
            
            # Collect all sources
            all_sources = []
            for agent_name, result in subagent_results.items():
                if isinstance(result, dict) and 'sources' in result:
                    all_sources.extend(result['sources'])
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Format final report
            markdown_report = format_research_report(
                target=target,
                synthesis=synthesis,
                sources=all_sources,
                metadata={
                    'execution_time': execution_time,
                    'agents_used': enabled_agents,
                    'person_name': person_name,
                    'timestamp': datetime.utcnow().isoformat()
                }
            )
            
            logger.info(f"Research completed in {execution_time:.1f}s with {len(all_sources)} sources")
            
            return {
                'markdown_report': markdown_report,
                'source_count': len(all_sources),
                'metadata': {
                    'execution_time': execution_time,
                    'agents_used': enabled_agents,
                    'subtasks': subtasks,
                    'timestamp': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error in research orchestration: {str(e)}")
            raise ResearchOrchestrationError(f"Research orchestration failed: {str(e)}")
    
    async def _decompose_tasks(
        self,
        target: str,
        enabled_agents: List[str],
        additional_context: str
    ) -> Dict[str, str]:
        """
        Lead agent decomposes research into subtasks.
        
        Returns:
            Dictionary of subtask descriptions
        """
        try:
            prompt = DELEGATION_PROMPT.format(
                query=f"Comprehensive research on {target}",
                target=target,
                enabled_agents=', '.join(enabled_agents),
                additional_context=additional_context or 'None'
            )
            
            response = self.cerebras.ask_ai(prompt, max_tokens=500)
            
            # Parse subtasks (simplified - in production, use better parsing)
            subtasks = {
                'decomposition': response
            }
            
            logger.info(f"Task decomposition complete: {len(response)} chars")
            return subtasks
            
        except Exception as e:
            logger.error(f"Error in task decomposition: {str(e)}")
            return {'decomposition': 'Standard research approach'}
    
    async def _execute_subagents(
        self,
        target: str,
        enabled_agents: List[str],
        person_name: Optional[str],
        person_linkedin: Optional[str],
        additional_context: str
    ) -> Dict[str, Any]:
        """
        Execute all enabled sub-agents in parallel.
        
        Returns:
            Dictionary of agent results
        """
        results = {}
        
        # Create tasks for parallel execution
        tasks = []
        
        # Company Discovery Agent (always enabled)
        if 'company_discovery' in enabled_agents or len(enabled_agents) == 0:
            tasks.append(self._company_discovery_agent(target, additional_context))
        
        # Person Research Agent
        if 'person_research' in enabled_agents and person_name:
            tasks.append(self._person_research_agent(person_name, person_linkedin))
        
        # Market Analysis Agent
        if 'market_analysis' in enabled_agents:
            tasks.append(self._market_analysis_agent(target))
        
        # Competitor Research Agent
        if 'competitor_research' in enabled_agents:
            tasks.append(self._competitor_research_agent(target))
        
        # Execute all agents in parallel
        agent_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        agent_names = []
        if 'company_discovery' in enabled_agents or len(enabled_agents) == 0:
            agent_names.append('company')
        if 'person_research' in enabled_agents and person_name:
            agent_names.append('person')
        if 'market_analysis' in enabled_agents:
            agent_names.append('market')
        if 'competitor_research' in enabled_agents:
            agent_names.append('competitor')
        
        for i, agent_name in enumerate(agent_names):
            if i < len(agent_results):
                result = agent_results[i]
                if isinstance(result, Exception):
                    logger.error(f"Agent {agent_name} failed: {str(result)}")
                    results[agent_name] = {'error': str(result), 'sources': []}
                else:
                    results[agent_name] = result
        
        return results
    
    async def _company_discovery_agent(
        self,
        target: str,
        additional_context: str
    ) -> Dict[str, Any]:
        """
        Company Discovery Agent - Research company profile and information.
        """
        logger.info(f"Company Discovery Agent starting for: {target}")
        
        try:
            # Search for company information
            searches = [
                f"{target} company profile",
                f"{target} products services",
                f"{target} about company overview"
            ]
            
            all_sources = []
            
            # Execute searches
            for search_query in searches:
                try:
                    results = self.exa.search_web(search_query, num_results=3)
                    all_sources.extend(results)
                except Exception as e:
                    logger.warning(f"Search failed for '{search_query}': {str(e)}")
            
            # If target looks like a URL, try find_similar
            if target.startswith('http://') or target.startswith('https://'):
                try:
                    similar = self.exa.find_similar_companies(target, num_results=3)
                    all_sources.extend(similar)
                except Exception as e:
                    logger.warning(f"Find similar failed: {str(e)}")
            
            # Remove duplicates
            unique_sources = self._deduplicate_sources(all_sources)
            
            # Analyze with AI
            sources_text = format_sources_for_prompt(unique_sources, max_sources=5)
            prompt = COMPANY_ANALYSIS_PROMPT.format(
                query=target,
                sources=sources_text
            )
            
            analysis = self.cerebras.ask_ai(prompt, max_tokens=800)
            
            logger.info(f"Company Discovery complete: {len(unique_sources)} sources")
            
            return {
                'analysis': analysis,
                'sources': unique_sources[:10],  # Top 10 sources
                'agent': 'company_discovery'
            }
            
        except Exception as e:
            logger.error(f"Company Discovery Agent error: {str(e)}")
            raise
    
    async def _person_research_agent(
        self,
        person_name: str,
        person_linkedin: Optional[str]
    ) -> Dict[str, Any]:
        """
        Person Research Agent - Research person background and generate talking points.
        """
        logger.info(f"Person Research Agent starting for: {person_name}")
        
        try:
            # Search for person information
            person_sources = self.exa.search_person(person_name, person_linkedin)
            
            # Also search for recent activity
            try:
                recent_results = self.exa.search_web(
                    f"{person_name} recent news articles",
                    num_results=3
                )
                person_sources.extend(recent_results)
            except Exception as e:
                logger.warning(f"Recent activity search failed: {str(e)}")
            
            # Remove duplicates
            unique_sources = self._deduplicate_sources(person_sources)
            
            # Extract profile
            sources_text = format_sources_for_prompt(unique_sources, max_sources=5)
            profile_prompt = PERSON_PROFILE_PROMPT.format(
                person_name=person_name,
                sources=sources_text
            )
            
            profile = self.cerebras.ask_ai_long(profile_prompt, max_tokens=800)
            
            # Generate talking points
            talking_points_prompt = TALKING_POINTS_PROMPT.format(
                person_profile=profile,
                person_name=person_name
            )
            
            talking_points = self.cerebras.ask_ai(talking_points_prompt, max_tokens=500)
            
            logger.info(f"Person Research complete: {len(unique_sources)} sources")
            
            return {
                'profile': profile,
                'talking_points': talking_points,
                'sources': unique_sources[:8],
                'agent': 'person_research'
            }
            
        except Exception as e:
            logger.error(f"Person Research Agent error: {str(e)}")
            raise
    
    async def _market_analysis_agent(self, target: str) -> Dict[str, Any]:
        """
        Market Analysis Agent - Research market size, trends, and opportunities.
        """
        logger.info(f"Market Analysis Agent starting for: {target}")
        
        try:
            # Search for market information
            searches = [
                f"{target} market size analysis",
                f"{target} industry trends 2024 2025",
                f"{target} market opportunities growth"
            ]
            
            all_sources = []
            
            for search_query in searches:
                try:
                    results = self.exa.search_web(search_query, num_results=3)
                    all_sources.extend(results)
                except Exception as e:
                    logger.warning(f"Search failed for '{search_query}': {str(e)}")
            
            unique_sources = self._deduplicate_sources(all_sources)
            
            # Analyze market
            sources_text = format_sources_for_prompt(unique_sources, max_sources=5)
            prompt = MARKET_ANALYSIS_PROMPT.format(
                target=target,
                sources=sources_text
            )
            
            analysis = self.cerebras.ask_ai_long(prompt, max_tokens=800)
            
            logger.info(f"Market Analysis complete: {len(unique_sources)} sources")
            
            return {
                'analysis': analysis,
                'sources': unique_sources[:8],
                'agent': 'market_analysis'
            }
            
        except Exception as e:
            logger.error(f"Market Analysis Agent error: {str(e)}")
            raise
    
    async def _competitor_research_agent(self, target: str) -> Dict[str, Any]:
        """
        Competitor Research Agent - Research competitive landscape.
        """
        logger.info(f"Competitor Research Agent starting for: {target}")
        
        try:
            # Search for competitors
            searches = [
                f"{target} competitors alternatives",
                f"{target} vs comparison",
                f"{target} competitive landscape"
            ]
            
            all_sources = []
            
            for search_query in searches:
                try:
                    results = self.exa.search_web(search_query, num_results=3)
                    all_sources.extend(results)
                except Exception as e:
                    logger.warning(f"Search failed for '{search_query}': {str(e)}")
            
            # If target is URL, find similar companies
            if target.startswith('http://') or target.startswith('https://'):
                try:
                    similar = self.exa.find_similar_companies(target, num_results=5)
                    all_sources.extend(similar)
                except Exception as e:
                    logger.warning(f"Similar companies search failed: {str(e)}")
            
            unique_sources = self._deduplicate_sources(all_sources)
            
            # Analyze competitors
            sources_text = format_sources_for_prompt(unique_sources, max_sources=6)
            prompt = COMPETITOR_ANALYSIS_PROMPT.format(
                target=target,
                sources=sources_text
            )
            
            analysis = self.cerebras.ask_ai_long(prompt, max_tokens=800)
            
            logger.info(f"Competitor Research complete: {len(unique_sources)} sources")
            
            return {
                'analysis': analysis,
                'sources': unique_sources[:8],
                'agent': 'competitor_research'
            }
            
        except Exception as e:
            logger.error(f"Competitor Research Agent error: {str(e)}")
            raise
    
    async def _feedback_loop(
        self,
        target: str,
        subagent_results: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Feedback loop to identify gaps and execute follow-up searches.
        
        Returns:
            Dictionary with follow-up results, or None if no gaps
        """
        try:
            # Compile findings
            findings_parts = []
            for agent_name, result in subagent_results.items():
                if isinstance(result, dict) and 'analysis' in result:
                    findings_parts.append(f"**{agent_name.upper()}:**\n{result['analysis']}\n")
                elif isinstance(result, dict) and 'profile' in result:
                    findings_parts.append(f"**{agent_name.upper()}:**\n{result['profile']}\n")
            
            findings = "\n".join(findings_parts)
            
            # Ask AI to identify gaps
            prompt = FEEDBACK_LOOP_PROMPT.format(findings=findings)
            gaps_response = self.cerebras.ask_ai(prompt, max_tokens=300)
            
            # Check if follow-up is needed
            if 'NONE' in gaps_response.upper() or not gaps_response.strip():
                logger.info("Feedback loop: No gaps identified")
                return None
            
            logger.info(f"Feedback loop: Gaps identified, executing follow-up")
            
            # Parse follow-up queries (simple parsing)
            lines = gaps_response.strip().split('\n')
            follow_up_queries = [
                line.strip('- ').strip('1234567890. ').strip()
                for line in lines
                if line.strip() and len(line.strip()) > 10
            ][:3]  # Max 3 follow-ups
            
            # Execute follow-up searches
            follow_up_sources = []
            for query in follow_up_queries:
                try:
                    results = self.exa.search_web(query, num_results=2)
                    follow_up_sources.extend(results)
                except Exception as e:
                    logger.warning(f"Follow-up search failed for '{query}': {str(e)}")
            
            if not follow_up_sources:
                return None
            
            unique_sources = self._deduplicate_sources(follow_up_sources)
            
            # Analyze follow-up findings
            sources_text = format_sources_for_prompt(unique_sources, max_sources=4)
            analysis_prompt = f"Based on these additional sources about {target}, provide key insights:\n\n{sources_text}"
            
            analysis = self.cerebras.ask_ai(analysis_prompt, max_tokens=400)
            
            logger.info(f"Feedback loop complete: {len(unique_sources)} additional sources")
            
            return {
                'analysis': analysis,
                'sources': unique_sources,
                'queries': follow_up_queries,
                'agent': 'follow_up'
            }
            
        except Exception as e:
            logger.error(f"Feedback loop error: {str(e)}")
            return None
    
    async def _synthesize_findings(
        self,
        target: str,
        subagent_results: Dict[str, Any],
        enabled_agents: List[str]
    ) -> str:
        """
        Synthesize all agent findings into a comprehensive analysis.
        
        Returns:
            Synthesized report text
        """
        try:
            # Compile all findings
            findings_parts = []
            
            for agent_name, result in subagent_results.items():
                if isinstance(result, dict):
                    if 'analysis' in result:
                        findings_parts.append(
                            f"## {agent_name.replace('_', ' ').title()}\n{result['analysis']}\n"
                        )
                    if 'profile' in result:
                        findings_parts.append(
                            f"## Person Profile\n{result['profile']}\n"
                        )
                    if 'talking_points' in result:
                        findings_parts.append(
                            f"## Talking Points\n{result['talking_points']}\n"
                        )
            
            subagent_findings = "\n".join(findings_parts)
            
            # Count total sources
            total_sources = sum(
                len(result.get('sources', []))
                for result in subagent_results.values()
                if isinstance(result, dict)
            )
            
            # Synthesize with AI
            prompt = MULTI_AGENT_SYNTHESIS_PROMPT.format(
                query=target,
                subagent_findings=subagent_findings,
                total_sources=total_sources,
                num_agents=len(enabled_agents)
            )
            
            synthesis = self.cerebras.synthesize_research(prompt)
            
            logger.info("Synthesis complete")
            
            return synthesis
            
        except Exception as e:
            logger.error(f"Synthesis error: {str(e)}")
            # Return basic findings if synthesis fails
            return subagent_findings
    
    def _deduplicate_sources(self, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate sources based on URL."""
        seen_urls = set()
        unique = []
        
        for source in sources:
            url = source.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique.append(source)
        
        return unique


class ResearchOrchestrationError(Exception):
    """Exception raised for errors in research orchestration."""
    pass


# Global instance
_orchestrator: Optional[ResearchOrchestrator] = None


def get_research_orchestrator() -> ResearchOrchestrator:
    """Get or create the global research orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ResearchOrchestrator()
    return _orchestrator
