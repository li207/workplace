# Test Isolation Strategy

## Problem
Testing agents that manipulate real task files could:
- Corrupt production data
- Create test artifacts in live workspace
- Interfere with actual work
- Make tests unreliable due to existing data

## Isolation Approaches

### Option 1: Temporary Test Environment
Create isolated test workspace that gets cleaned up:

```bash
# Setup test environment
TEST_DATA_DIR="/tmp/workspace-test-$(date +%s)"
export WORKSPACE_DATA_DIR="$TEST_DATA_DIR"

# Create test structure
mkdir -p "$TEST_DATA_DIR"/active/test01/{docs,logs,scratch}
mkdir -p "$TEST_DATA_DIR"/weeks

# Create test task
cat > "$TEST_DATA_DIR/active/test01/task.md" << 'EOF'
# Test task
- **id**: test01
- **priority**: p1
- **created**: 2026-02-01
- **tags**: [testing]

## Context
Test task for validation
EOF

# Run tests in isolation
./test-suite.sh

# Cleanup
rm -rf "$TEST_DATA_DIR"
```

### Option 2: Backup/Restore Pattern
```bash
# Backup production data
cp -r workspace-data workspace-data.backup

# Run tests (may modify data)
./test-suite.sh

# Restore original data
rm -rf workspace-data
mv workspace-data.backup workspace-data
```

### Option 3: Docker Container Testing
```dockerfile
FROM alpine
COPY framework /workspace
WORKDIR /workspace
RUN ./bootstrap.sh
CMD ["./run-tests.sh"]
```

### Option 4: Test Configuration Override
Modify commands to accept test data directory:

```bash
# Override workspace path for testing
echo "WORKSPACE_DATA_DIR=/tmp/test-workspace" > ~/.claude/test-workspace-path.txt

# Commands check for test config first
if [[ -f ~/.claude/test-workspace-path.txt ]]; then
    source ~/.claude/test-workspace-path.txt
else
    source ~/.claude/workspace-path.txt
fi
```

## Recommended Approach: Temporary Environment

**Benefits:**
- Complete isolation from production
- No risk of data corruption
- Parallel test execution possible
- Easy cleanup

**Implementation:**
```bash
#!/bin/bash
# test-runner.sh

# Create isolated test environment
TEST_ID="test-$(date +%s)-$$"
TEST_DIR="/tmp/workspace-$TEST_ID"
export WORKSPACE_DATA_DIR="$TEST_DIR"

echo "Creating test environment: $TEST_DIR"

# Setup test structure (unified task layout)
mkdir -p "$TEST_DIR"/active/test01/{docs,logs,scratch}
mkdir -p "$TEST_DIR"/weeks

# Create test task
cat > "$TEST_DIR/active/test01/task.md" << 'EOF'
# Test task alpha
- **id**: test01
- **priority**: p1
- **created**: 2026-02-01
- **tags**: [testing]

## Context
Test task for framework validation
EOF

# Override workspace config for this session
cat > ~/.claude/test-workspace-path.txt << EOF
WORKSPACE_DIR=/Users/lizhongzhang/Projects/workspace
WORKSPACE_DATA_DIR=$TEST_DIR
EOF

# Run tests
echo "Running tests..."
./tests/test-suite.sh

# Cleanup
echo "Cleaning up test environment..."
rm -rf "$TEST_DIR"
rm -f ~/.claude/test-workspace-path.txt

echo "Tests complete"
```

## Test Data Patterns

### Synthetic Test Tasks
```bash
# Create predictable test data
cat > "$TEST_DIR/active/test01/task.md" << 'EOF'
# Test task alpha
- **id**: test01
- **priority**: p1
- **created**: 2026-02-01
- **tags**: [testing]

## Context
Test task for framework validation
EOF
```

### Expected State Verification
```bash
# Verify task creation
function test_task_creation() {
    local initial_count
    initial_count=$(ls -1 "$WORKSPACE_DATA_DIR/active/" 2>/dev/null | wc -l)

    # Run command
    /task create "New test task"

    # Verify result
    local final_count
    final_count=$(ls -1 "$WORKSPACE_DATA_DIR/active/" 2>/dev/null | wc -l)

    if (( final_count == initial_count + 1 )); then
        echo "Task creation test passed"
    else
        echo "Task creation test failed: expected $((initial_count + 1)), got $final_count"
        return 1
    fi
}
```

## File State Verification

Instead of testing implementation details, test observable behaviors:

```bash
# Test: Task completion archives task folder
function test_task_archive_integration() {
    # Setup
    mkdir -p "$WORKSPACE_DATA_DIR/active/test01"/{docs,logs,scratch}
    cat > "$WORKSPACE_DATA_DIR/active/test01/task.md" << 'EOF'
# Test task
- **id**: test01
- **priority**: p1
- **created**: 2026-02-01

## Context
Test task
EOF

    # Action
    echo "/task done test01" | claude-code

    # Verify
    if [[ -d "$WORKSPACE_DATA_DIR/archive/test01" ]]; then
        echo "Task archived correctly"
    else
        echo "Task not archived"
        return 1
    fi
}
```

## Benefits of This Approach

1. **Zero Production Risk** - No chance of corrupting real data
2. **Predictable State** - Tests start with known, clean state
3. **Parallel Execution** - Multiple test runs can't interfere
4. **Fast Cleanup** - Simple directory removal
5. **CI/CD Ready** - Works in any environment

This strategy ensures our tests are reliable, safe, and don't interfere with actual workspace usage!
