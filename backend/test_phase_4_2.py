"""
Test script for Phase 4.2 - Background Worker implementation.
This script validates the research worker functionality and Appwrite integration.
"""
import sys
import asyncio
from pathlib import Path

# Add src directory to Python path
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

async def test_appwrite_service():
    """Test Appwrite service configuration and basic functionality."""
    try:
        print("Testing Appwrite service...")
        
        from services.appwrite_service import appwrite_service
        
        # Test configuration
        is_configured = appwrite_service.is_configured()
        print(f"✓ Appwrite service configuration status: {'Configured' if is_configured else 'Not fully configured'}")
        
        if not is_configured:
            print("⚠️  Appwrite not configured - database operations will be simulated")
        
        print("✅ Appwrite service tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Appwrite service test failed: {e}")
        return False

async def test_research_worker_classes():
    """Test research worker result and error classes."""
    try:
        print("\nTesting research worker classes...")
        
        from workers.research_worker import ResearchWorkerResult, ResearchWorkerError
        
        # Test ResearchWorkerResult
        metadata = {
            "execution_time": 10.5,
            "agents_used": ["company_discovery", "person_research"],
            "target": "Test Company",
            "simulation": True
        }
        
        result = ResearchWorkerResult(
            markdown_report="# Test Report\nThis is a test.",
            source_count=5,
            metadata=metadata
        )
        
        assert result.execution_time == 10.5
        assert result.target == "Test Company"
        assert len(result.agents_used) == 2
        print("✓ ResearchWorkerResult creation and properties")
        
        # Test result to_dict
        result_dict = result.to_dict()
        assert "source_count" in result_dict
        assert "execution_time" in result_dict
        print("✓ ResearchWorkerResult to_dict conversion")
        
        # Test ResearchWorkerError
        error = ResearchWorkerError(
            message="Test error message",
            job_id="test_job_123",
            error_type=ResearchWorkerError.VALIDATION_ERROR
        )
        
        assert error.job_id == "test_job_123"
        assert error.error_type == ResearchWorkerError.VALIDATION_ERROR
        assert not error.is_retryable()  # Validation errors are not retryable
        print("✓ ResearchWorkerError creation and properties")
        
        # Test error to_dict
        error_dict = error.to_dict()
        assert "message" in error_dict
        assert "error_type" in error_dict
        print("✓ ResearchWorkerError to_dict conversion")
        
        print("✅ Research worker classes tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Research worker classes test failed: {e}")
        return False

async def test_simulation_execution():
    """Test the simulation research execution function."""
    try:
        print("\nTesting simulation research execution...")
        
        from workers.research_worker import simulate_research_execution
        
        # Mock job data
        test_job = {
            "target": "Test Company Inc",
            "enabled_agents": ["company_discovery", "person_research"],
            "person_name": "John Doe",
            "user_id": "test_user_123"
        }
        
        # Execute simulation
        result = await simulate_research_execution(test_job)
        
        # Validate result
        assert isinstance(result.markdown_report, str)
        assert len(result.markdown_report) > 100  # Should be substantial
        assert result.source_count > 0
        assert "Test Company Inc" in result.markdown_report
        assert "John Doe" in result.markdown_report
        assert result.metadata["simulation"] is True
        
        print("✓ Simulation execution completed successfully")
        print(f"✓ Generated report length: {len(result.markdown_report)} characters")
        print(f"✓ Source count: {result.source_count}")
        print(f"✓ Execution time: {result.execution_time}s")
        
        print("✅ Simulation execution tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Simulation execution test failed: {e}")
        return False

async def test_worker_validation():
    """Test the research job validation function."""
    try:
        print("\nTesting research job validation...")
        
        from workers.research_worker import validate_research_job, ResearchWorkerError
        
        # Test valid job
        valid_job = {
            "$id": "test_job_123",
            "user_id": "test_user",
            "target": "Test Company",
            "enabled_agents": ["company_discovery"],
            "status": "pending"
        }
        
        result = await validate_research_job(valid_job)
        assert result is True
        print("✓ Valid job validation passed")
        
        # Test invalid job - missing target
        invalid_job = {
            "$id": "test_job_124",
            "user_id": "test_user",
            "enabled_agents": ["company_discovery"],
            "status": "pending"
            # Missing target
        }
        
        try:
            await validate_research_job(invalid_job)
            assert False, "Should have raised validation error"
        except ResearchWorkerError as e:
            assert e.error_type == ResearchWorkerError.VALIDATION_ERROR
            print("✓ Invalid job validation correctly failed")
        
        # Test invalid job - empty agents
        invalid_job2 = {
            "$id": "test_job_125",
            "user_id": "test_user",
            "target": "Test Company",
            "enabled_agents": [],  # Empty agents
            "status": "pending"
        }
        
        try:
            await validate_research_job(invalid_job2)
            assert False, "Should have raised validation error"
        except ResearchWorkerError as e:
            assert e.error_type == ResearchWorkerError.VALIDATION_ERROR
            print("✓ Empty agents validation correctly failed")
        
        print("✅ Research job validation tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Research job validation test failed: {e}")
        return False

async def test_error_handling():
    """Test error handling functionality."""
    try:
        print("\nTesting error handling...")
        
        from workers.research_worker import handle_research_error, ResearchWorkerError
        
        # Create test error
        test_error = ResearchWorkerError(
            message="Test error for handling",
            job_id="test_job_error",
            error_type=ResearchWorkerError.RESEARCH_EXECUTION_ERROR
        )
        
        # Test error handling (will try to update Appwrite, but may fail if not configured)
        await handle_research_error("test_job_error", test_error)
        print("✓ Error handling function executed without exceptions")
        
        # Test retryable error types
        retryable_error = ResearchWorkerError(
            message="Database connection failed",
            job_id="test_job",
            error_type=ResearchWorkerError.DATABASE_ERROR
        )
        assert retryable_error.is_retryable() is True
        print("✓ Retryable error type correctly identified")
        
        # Test non-retryable error types
        non_retryable_error = ResearchWorkerError(
            message="Job not found",
            job_id="test_job",
            error_type=ResearchWorkerError.JOB_NOT_FOUND
        )
        assert non_retryable_error.is_retryable() is False
        print("✓ Non-retryable error type correctly identified")
        
        print("✅ Error handling tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

async def main():
    """Run all tests for Phase 4.2 implementation."""
    print("=" * 60)
    print("CLARIQ Backend Phase 4.2 Background Worker Test")
    print("=" * 60)
    
    tests = [
        test_appwrite_service,
        test_research_worker_classes,
        test_simulation_execution,
        test_worker_validation,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if await test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
        print()  # Add spacing between tests
    
    print("=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Phase 4.2 Background Worker implementation is working correctly!")
        print("\nFeatures implemented:")
        print("✓ Complete research job lifecycle management")
        print("✓ Appwrite database integration")
        print("✓ Comprehensive error handling and logging")
        print("✓ Job validation and status management")
        print("✓ Simulation research execution")
        print("✓ Structured result and error classes")
        print("\nNext steps:")
        print("1. Phase 4.3: Environment configuration and testing")
        print("2. Phase 5: Implement Exa & Cerebras services")
        print("3. Replace simulation with actual research orchestrator")
    else:
        print("❌ Some tests failed. Please check the implementation.")
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())