# Phase 2 Enhancements - Advanced AI Intelligence
# Add these to your orchestrator after Phase 1 is working

import chromadb
import json
from pathlib import Path
import sqlite3
import numpy as np
from datetime import datetime
import hashlib

class EnhancedIntelligence:
    """Phase 2: Advanced AI capabilities"""
    
    def __init__(self):
        self.setup_vector_database()
        self.setup_knowledge_graph()
        self.setup_learning_system()
    
    def setup_vector_database(self):
        """Setup ChromaDB for project memory"""
        self.chroma_client = chromadb.PersistentClient(
            path=str(Path.home() / "pinak" / "vector_db")
        )
        
        # Collections for different types of knowledge
        self.projects_collection = self.chroma_client.get_or_create_collection("projects")
        self.patterns_collection = self.chroma_client.get_or_create_collection("patterns")
        self.errors_collection = self.chroma_client.get_or_create_collection("errors")
        
    def setup_knowledge_graph(self):
        """Setup simple knowledge graph using SQLite"""
        db_path = Path.home() / "pinak" / "knowledge.db"
        self.kg_conn = sqlite3.connect(db_path, check_same_thread=False)
        
        # Create knowledge graph tables
        self.kg_conn.executescript("""
            CREATE TABLE IF NOT EXISTS entities (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                type TEXT,
                properties TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS relationships (
                id INTEGER PRIMARY KEY,
                source_id INTEGER,
                target_id INTEGER,
                relationship_type TEXT,
                properties TEXT,
                strength REAL DEFAULT 1.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES entities (id),
                FOREIGN KEY (target_id) REFERENCES entities (id)
            );
            
            CREATE TABLE IF NOT EXISTS project_patterns (
                id INTEGER PRIMARY KEY,
                pattern_hash TEXT UNIQUE,
                pattern_data TEXT,
                success_rate REAL,
                usage_count INTEGER DEFAULT 1,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        self.kg_conn.commit()
    
    def setup_learning_system(self):
        """Setup simple learning and optimization"""
        self.learning_db = Path.home() / "pinak" / "learning.db"
        conn = sqlite3.connect(self.learning_db)
        
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS model_performance (
                id INTEGER PRIMARY KEY,
                model_name TEXT,
                task_type TEXT,
                performance_score REAL,
                execution_time REAL,
                token_count INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS optimization_rules (
                id INTEGER PRIMARY KEY,
                rule_name TEXT,
                condition_pattern TEXT,
                action TEXT,
                effectiveness REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        conn.close()
    
    async def enhanced_planning(self, request, context_history=None):
        """Phase 2: Context-aware planning with memory"""
        
        # 1. Search for similar projects
        similar_projects = self.find_similar_projects(request.description)
        
        # 2. Extract patterns from successful projects
        success_patterns = self.get_success_patterns(request.tech_stack)
        
        # 3. Generate enhanced plan with context
        enhanced_prompt = f"""
        Project Request: {request.description}
        Tech Stack: {request.tech_stack}
        
        Similar Successful Projects:
        {json.dumps(similar_projects, indent=2)}
        
        Proven Success Patterns:
        {json.dumps(success_patterns, indent=2)}
        
        Context from Previous Projects:
        {json.dumps(context_history or {}, indent=2)}
        
        Generate an enhanced project plan that:
        1. Learns from similar successful projects
        2. Applies proven patterns
        3. Avoids common pitfalls
        4. Optimizes for the specific tech stack
        5. Includes risk mitigation strategies
        
        Return detailed JSON plan with confidence scores.
        """
        
        # Use best available model based on performance history
        best_model = self.get_best_model_for_task("planning")
        
        response = await self.call_ollama_with_fallback(best_model, enhanced_prompt)
        plan = self.extract_json_from_response(response)
        
        # Store this planning session for future learning
        await self.store_planning_session(request, plan, similar_projects)
        
        return plan
    
    def find_similar_projects(self, description):
        """Find similar projects using vector similarity"""
        try:
            # Query vector database for similar projects
            results = self.projects_collection.query(
                query_texts=[description],
                n_results=5
            )
            
            similar_projects = []
            if results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    similarity_score = 1 - results['distances'][0][i]  # Convert distance to similarity
                    if similarity_score > 0.7:  # Only high-similarity projects
                        similar_projects.append({
                            "description": doc,
                            "similarity": similarity_score,
                            "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                        })
            
            return similar_projects
        except Exception as e:
            print(f"Error finding similar projects: {e}")
            return []
    
    def get_success_patterns(self, tech_stack):
        """Get successful patterns for specific tech stack"""
        cursor = self.kg_conn.cursor()
        cursor.execute("""
            SELECT pattern_data, success_rate, usage_count
            FROM project_patterns
            WHERE pattern_data LIKE ?
            ORDER BY success_rate DESC, usage_count DESC
            LIMIT 10
        """, (f"%{tech_stack}%",))
        
        patterns = []
        for row in cursor.fetchall():
            try:
                pattern_data = json.loads(row[0])
                patterns.append({
                    "pattern": pattern_data,
                    "success_rate": row[1],
                    "usage_count": row[2]
                })
            except json.JSONDecodeError:
                continue
        
        return patterns
    
    def get_best_model_for_task(self, task_type):
        """Get the best performing model for a specific task"""
        conn = sqlite3.connect(self.learning_db)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT model_name, AVG(performance_score) as avg_score
            FROM model_performance
            WHERE task_type = ?
            GROUP BY model_name
            ORDER BY avg_score DESC
            LIMIT 1
        """, (task_type,))
        
        result = cursor.fetchone()
        conn.close()
        
        # Return best model or default
        return result[0] if result else "llama3.1:8b"
    
    async def call_ollama_with_fallback(self, preferred_model, prompt):
        """Call Ollama with intelligent fallback"""
        models_to_try = [preferred_model, "llama3.1:8b", "codellama:7b", "mistral:7b"]
        
        for model in models_to_try:
            try:
                start_time = datetime.now()
                response = await self.call_ollama(model, prompt)
                end_time = datetime.now()
                
                # Record performance
                await self.record_model_performance(
                    model, 
                    "planning", 
                    1.0,  # Success score
                    (end_time - start_time).total_seconds(),
                    len(prompt)
                )
                
                return response
                
            except Exception as e:
                print(f"Model {model} failed: {e}")
                continue
        
        raise Exception("All models failed")
    
    async def record_model_performance(self, model_name, task_type, score, execution_time, token_count):
        """Record model performance for learning"""
        conn = sqlite3.connect(self.learning_db)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO model_performance 
            (model_name, task_type, performance_score, execution_time, token_count)
            VALUES (?, ?, ?, ?, ?)
        """, (model_name, task_type, score, execution_time, token_count))
        
        conn.commit()
        conn.close()
    
    async def store_planning_session(self, request, plan, similar_projects):
        """Store planning session for future learning"""
        
        # Store in vector database
        project_doc = f"{request.name}: {request.description}"
        metadata = {
            "tech_stack": request.tech_stack,
            "created_at": datetime.now().isoformat(),
            "plan_quality": self.assess_plan_quality(plan)
        }
        
        self.projects_collection.add(
            documents=[project_doc],
            metadatas=[metadata],
            ids=[f"project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"]
        )
        
        # Store pattern in knowledge graph
        pattern_hash = hashlib.md5(
            f"{request.tech_stack}_{json.dumps(plan, sort_keys=True)}".encode()
        ).hexdigest()
        
        cursor = self.kg_conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO project_patterns 
            (pattern_hash, pattern_data, success_rate, usage_count)
            VALUES (?, ?, ?, COALESCE((SELECT usage_count FROM project_patterns WHERE pattern_hash = ?) + 1, 1))
        """, (pattern_hash, json.dumps({
            "tech_stack": request.tech_stack,
            "plan_structure": plan,
            "similar_projects_used": len(similar_projects)
        }), 0.8, pattern_hash))  # Initial success rate
        
        self.kg_conn.commit()
    
    def assess_plan_quality(self, plan):
        """Simple plan quality assessment"""
        quality_score = 0.5  # Base score
        
        if isinstance(plan, dict):
            # Check for key components
            key_components = ["architecture", "technology", "files", "testing", "deployment"]
            present_components = sum(1 for comp in key_components if comp in str(plan).lower())
            quality_score += (present_components / len(key_components)) * 0.3
            
            # Check for detail level
            plan_text = json.dumps(plan)
            if len(plan_text) > 1000:  # Detailed plan
                quality_score += 0.2
        
        return min(quality_score, 1.0)
    
    async def multi_agent_code_generation(self, plan):
        """Phase 2: Multi-agent code generation with specialization"""
        
        agents = {
            "frontend": "codellama:7b",
            "backend": "llama3.1:8b", 
            "database": "mistral:7b",
            "testing": "codellama:7b",
            "devops": "llama3.1:8b"
        }
        
        generated_code = {}
        
        for agent_type, model in agents.items():
            agent_prompt = self.create_agent_prompt(agent_type, plan)
            
            try:
                response = await self.call_ollama_with_fallback(model, agent_prompt)
                code_section = self.extract_json_from_response(response)
                generated_code[agent_type] = code_section
                
                # Store successful patterns
                await self.store_code_pattern(agent_type, plan, code_section)
                
            except Exception as e:
                print(f"Agent {agent_type} failed: {e}")
                generated_code[agent_type] = {"error": str(e)}
        
        # Merge and optimize code sections
        merged_code = self.merge_agent_outputs(generated_code)
        
        return merged_code
    
    def create_agent_prompt(self, agent_type, plan):
        """Create specialized prompts for different agents"""
        
        base_context = f"Project Plan: {json.dumps(plan, indent=2)}\n\n"
        
        prompts = {
            "frontend": base_context + """
                You are a frontend specialist. Generate React/Vue/Svelte components based on this plan.
                Focus on: UI components, routing, state management, styling, responsive design.
                Return JSON with component files and their complete code.
            """,
            
            "backend": base_context + """
                You are a backend specialist. Generate API endpoints and server logic.
                Focus on: REST/GraphQL APIs, authentication, business logic, data validation.
                Return JSON with server files and their complete code.
            """,
            
            "database": base_context + """
                You are a database specialist. Generate schemas, migrations, and queries.
                Focus on: Database schema, indexes, relationships, seed data, queries.
                Return JSON with database files and their complete code.
            """,
            
            "testing": base_context + """
                You are a testing specialist. Generate comprehensive test suites.
                Focus on: Unit tests, integration tests, E2E tests, performance tests.
                Return JSON with test files and their complete code.
            """,
            
            "devops": base_context + """
                You are a DevOps specialist. Generate deployment and infrastructure code.
                Focus on: Docker, CI/CD, monitoring, scaling, security configurations.
                Return JSON with deployment files and their complete code.
            """
        }
        
        return prompts.get(agent_type, base_context)
    
    def merge_agent_outputs(self, agent_outputs):
        """Merge outputs from different specialized agents"""
        merged = {"files": {}, "agents_used": list(agent_outputs.keys())}
        
        for agent_type, output in agent_outputs.items():
            if "error" not in output and "files" in output:
                # Add agent prefix to avoid conflicts
                for filename, content in output["files"].items():
                    prefixed_name = f"{agent_type}_{filename}"
                    merged["files"][prefixed_name] = content
        
        return merged
    
    async def store_code_pattern(self, agent_type, plan, code_output):
        """Store successful code patterns for learning"""
        pattern = {
            "agent_type": agent_type,
            "plan_context": plan,
            "code_structure": self.analyze_code_structure(code_output),
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in vector database for future retrieval
        self.patterns_collection.add(
            documents=[json.dumps(pattern)],
            metadatas=[{"agent_type": agent_type, "success": True}],
            ids=[f"pattern_{agent_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"]
        )
    
    def analyze_code_structure(self, code_output):
        """Analyze code structure for pattern recognition"""
        if not isinstance(code_output, dict) or "files" not in code_output:
            return {}
        
        structure = {
            "file_count": len(code_output["files"]),
            "file_types": {},
            "complexity_score": 0
        }
        
        for filename, content in code_output["files"].items():
            # Analyze file types
            extension = filename.split('.')[-1] if '.' in filename else "unknown"
            structure["file_types"][extension] = structure["file_types"].get(extension, 0) + 1
            
            # Simple complexity score based on content length
            structure["complexity_score"] += len(str(content))
        
        return structure


# Integration with main orchestrator
class EnhancedOrchestrator(PinakOrchestrator):
    """Enhanced orchestrator with Phase 2 intelligence"""
    
    def __init__(self):
        super().__init__()
        self.intelligence = EnhancedIntelligence()
    
    async def create_project(self, request):
        """Enhanced project creation with advanced AI"""
        logger.info(f"Creating enhanced project: {request.name}")
        
        project_id = f"{request.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        project_path = self.projects_dir / project_id
        project_path.mkdir(exist_ok=True)
        
        # Enhanced Phase 1: Context-aware planning
        plan = await self.intelligence.enhanced_planning(request)
        
        # Enhanced Phase 2: Multi-agent code generation
        code = await self.intelligence.multi_agent_code_generation(plan)
        
        # Enhanced Phase 3: Intelligent testing
        tests = await self.generate_enhanced_tests(code, plan)
        
        # Enhanced Phase 4: Optimized deployment
        deployment = await self.prepare_enhanced_deployment(project_path, code, plan)
        
        result = {
            "project_id": project_id,
            "status": "enhanced_ready",
            "plan": plan,
            "code_generated": len(code.get("files", [])),
            "agents_used": code.get("agents_used", []),
            "tests_created": len(tests.get("files", [])),
            "deployment_ready": deployment.get("ready", False),
            "intelligence_features": ["context_aware", "multi_agent", "pattern_learning"]
        }
        
        # Save enhanced metadata
        with open(project_path / "pinak_enhanced_metadata.json", "w") as f:
            json.dump(result, f, indent=2)
        
        return result