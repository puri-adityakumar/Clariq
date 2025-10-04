"""
Test script for Phase 4.1 implementation.
This script validates that the research API endpoints are properly implemented.
"""
import sys
from pathlib import Path

# Add src directory to Python path
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

def test_imports():
    """Test that all modules can be imported successfully."""
    try:
        print("Testing imports...")
        
        # Test main application
        from main import create_app
        print("✓ Main application import successful")
        
        # Test research API
        from api.research import router as research_router
        print("✓ Research API import successful")
        
        # Test research worker
        from workers.research_worker import execute_research_worker
        print("✓ Research worker import successful")
        
        # Test rate limiting
        from utils.rate_limiting import check_research_rate_limit
        print("✓ Rate limiting import successful")
        
        print("\n✅ All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_app_creation():
    """Test that the FastAPI app can be created with research endpoints."""
    try:
        print("\nTesting app creation...")
        from main import create_app
        
        app = create_app()
        
        # Check that research routes are included
        routes = [route.path for route in app.routes]
        expected_routes = [
            "/v1/research/execute/{job_id}",
            "/v1/research/status/{job_id}",
            "/v1/research/health"
        ]
        
        for route in expected_routes:
            if any(route in r for r in routes):
                print(f"✓ Route {route} found")
            else:
                print(f"❌ Route {route} missing")
                return False
        
        print("✅ App creation and route registration successful!")
        return True
        
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return False

def test_rate_limiter():
    """Test the rate limiter functionality."""
    try:
        print("\nTesting rate limiter...")
        from utils.rate_limiting import rate_limiter
        
        # Test basic functionality
        test_user = "test_user_123"
        
        # Should allow initial requests
        assert rate_limiter.check_rate_limit(test_user, "execution") == True
        print("✓ Rate limiter allows initial request")
        
        # Check remaining requests
        remaining = rate_limiter.get_remaining_requests(test_user, "execution")
        assert remaining == 4  # 5 - 1 = 4
        print(f"✓ Remaining requests: {remaining}")
        
        print("✅ Rate limiter tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Rate limiter test failed: {e}")
        return False

def main():
    """Run all tests for Phase 4.1 implementation."""
    print("=" * 50)
    print("CLARIQ Backend Phase 4.1 Implementation Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_app_creation,
        test_rate_limiter
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests
    
    print("=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Phase 4.1 implementation is working correctly!")
        print("\nNext steps:")
        print("1. Phase 4.2: Implement background worker")
        print("2. Phase 4.3: Add Appwrite backend integration")
        print("3. Phase 5: Implement Exa & Cerebras services")
    else:
        print("❌ Some tests failed. Please check the implementation.")
    
    print("=" * 50)

if __name__ == "__main__":
    main()