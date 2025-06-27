#!/usr/bin/env python3
"""
PrismIntelligence-OpenManus Integration
Multi-Agent Property Intelligence System

This script integrates OpenManus with PrismIntelligence to create a powerful
multi-agent property management document processing system.
"""

import asyncio
import sys
import os
import json
import argparse
from pathlib import Path
from typing import Dict, Any, Optional

# Add OpenManus to path
sys.path.insert(0, str(Path(__file__).parent / "openmanus"))

from app.flow.property_intelligence_flow import PropertyIntelligenceFlow
from app.llm.llm import LLM
from app.config.config import Config


class PrismIntelligenceOrchestrator:
    """
    Main orchestrator for PrismIntelligence multi-agent system
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the orchestrator with configuration"""
        
        # Load configuration
        config_file = config_path or "openmanus/config/prism_intelligence.toml"
        if not os.path.exists(config_file):
            config_file = "openmanus/config/config.example.toml"
            print(f"⚠️ Custom config not found, using example config: {config_file}")
        
        self.config = Config(config_file)
        
        # Initialize components
        self.property_flow = PropertyIntelligenceFlow()
        self.processing_stats = {
            "documents_processed": 0,
            "successful_analyses": 0,
            "failed_analyses": 0,
            "total_processing_time": 0.0
        }
        
        print("🎯 PrismIntelligence-OpenManus Integration Initialized")
        print(f"📋 Config loaded from: {config_file}")
    
    async def process_document(
        self, 
        file_path: str, 
        historical_context: Optional[Dict[str, Any]] = None,
        processing_options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a single property management document
        
        Args:
            file_path: Path to the document to process
            historical_context: Optional historical data for comparative analysis
            processing_options: Optional processing parameters
            
        Returns:
            Comprehensive analysis results
        """
        
        start_time = asyncio.get_event_loop().time()
        
        try:
            print(f"🚀 Processing document: {Path(file_path).name}")
            
            # Execute the property intelligence flow
            result = await self.property_flow.execute(
                file_path,
                historical_context=historical_context,
                processing_options=processing_options or {}
            )
            
            processing_time = asyncio.get_event_loop().time() - start_time
            
            # Update statistics
            self.processing_stats["documents_processed"] += 1
            self.processing_stats["successful_analyses"] += 1
            self.processing_stats["total_processing_time"] += processing_time
            
            print(f"✅ Document processed successfully in {processing_time:.2f} seconds")
            
            return {
                "status": "success",
                "processing_time": processing_time,
                "result": result,
                "file_path": file_path
            }
            
        except Exception as e:
            processing_time = asyncio.get_event_loop().time() - start_time
            
            # Update error statistics
            self.processing_stats["documents_processed"] += 1
            self.processing_stats["failed_analyses"] += 1
            self.processing_stats["total_processing_time"] += processing_time
            
            print(f"❌ Document processing failed: {str(e)}")
            
            return {
                "status": "error",
                "processing_time": processing_time,
                "error": str(e),
                "file_path": file_path
            }
    
    async def process_directory(
        self, 
        directory_path: str,
        file_pattern: str = "*.csv",
        max_files: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Process all matching files in a directory
        
        Args:
            directory_path: Directory containing documents to process
            file_pattern: File pattern to match (e.g., "*.csv", "*.xlsx")
            max_files: Maximum number of files to process
            
        Returns:
            List of processing results
        """
        
        directory = Path(directory_path)
        if not directory.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        # Find matching files
        files = list(directory.glob(file_pattern))
        if max_files:
            files = files[:max_files]
        
        print(f"📁 Processing {len(files)} files from {directory_path}")
        
        results = []
        
        for file_path in files:
            result = await self.process_document(str(file_path))
            results.append(result)
            
            # Brief pause between files to avoid overwhelming APIs
            await asyncio.sleep(1)
        
        return results
    
    async def watch_directory(
        self,
        watch_path: str,
        file_patterns: List[str] = None
    ):
        """
        Watch a directory for new files and process them automatically
        
        Args:
            watch_path: Directory to watch
            file_patterns: List of file patterns to watch for
        """
        
        if file_patterns is None:
            file_patterns = ["*.csv", "*.xlsx", "*.pdf"]
        
        print(f"👀 Watching directory: {watch_path}")
        print(f"📋 File patterns: {file_patterns}")
        print("🛑 Press Ctrl+C to stop watching")
        
        processed_files = set()
        
        try:
            while True:
                watch_dir = Path(watch_path)
                
                if watch_dir.exists():
                    # Check for new files
                    for pattern in file_patterns:
                        for file_path in watch_dir.glob(pattern):
                            file_key = str(file_path.absolute())
                            
                            if file_key not in processed_files:
                                print(f"🔍 New file detected: {file_path.name}")
                                
                                # Process the file
                                result = await self.process_document(str(file_path))
                                processed_files.add(file_key)
                                
                                if result["status"] == "success":
                                    # Move processed file to processed directory
                                    await self._archive_processed_file(file_path)
                
                # Wait before next check
                await asyncio.sleep(5)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping directory watch...")
            self.print_processing_stats()
    
    async def _archive_processed_file(self, file_path: Path):
        """Move processed file to archive directory"""
        try:
            processed_dir = file_path.parent.parent / "processed"
            processed_dir.mkdir(exist_ok=True)
            
            # Create timestamped filename
            timestamp = asyncio.get_event_loop().time()
            new_name = f"{timestamp:.0f}_{file_path.name}"
            new_path = processed_dir / new_name
            
            file_path.rename(new_path)
            print(f"📦 Archived: {file_path.name} → {new_name}")
            
        except Exception as e:
            print(f"⚠️ Could not archive file {file_path.name}: {str(e)}")
    
    def print_processing_stats(self):
        """Print processing statistics"""
        stats = self.processing_stats
        
        print("\n📊 Processing Statistics:")
        print(f"   Documents Processed: {stats['documents_processed']}")
        print(f"   Successful Analyses: {stats['successful_analyses']}")
        print(f"   Failed Analyses: {stats['failed_analyses']}")
        print(f"   Total Processing Time: {stats['total_processing_time']:.2f} seconds")
        
        if stats['documents_processed'] > 0:
            avg_time = stats['total_processing_time'] / stats['documents_processed']
            success_rate = stats['successful_analyses'] / stats['documents_processed']
            print(f"   Average Processing Time: {avg_time:.2f} seconds")
            print(f"   Success Rate: {success_rate:.1%}")
    
    async def run_interactive_mode(self):
        """Run in interactive mode for testing"""
        
        print("\n🎮 Interactive Mode - PrismIntelligence Multi-Agent System")
        print("Commands:")
        print("  process <file_path>     - Process a single document")
        print("  batch <directory>       - Process all files in directory")
        print("  watch <directory>       - Watch directory for new files")
        print("  stats                   - Show processing statistics")
        print("  quit                    - Exit")
        
        while True:
            try:
                command = input("\n🎯 Enter command: ").strip().split()
                
                if not command:
                    continue
                
                cmd = command[0].lower()
                
                if cmd == "quit":
                    break
                elif cmd == "process" and len(command) > 1:
                    result = await self.process_document(command[1])
                    print(f"Result: {result['status']}")
                elif cmd == "batch" and len(command) > 1:
                    results = await self.process_directory(command[1])
                    successful = sum(1 for r in results if r['status'] == 'success')
                    print(f"Processed {len(results)} files, {successful} successful")
                elif cmd == "watch" and len(command) > 1:
                    await self.watch_directory(command[1])
                elif cmd == "stats":
                    self.print_processing_stats()
                else:
                    print("❌ Invalid command or missing parameters")
                    
            except KeyboardInterrupt:
                print("\n👋 Exiting interactive mode...")
                break
            except Exception as e:
                print(f"❌ Error: {str(e)}")
        
        self.print_processing_stats()


async def main():
    """Main entry point"""
    
    parser = argparse.ArgumentParser(
        description="PrismIntelligence Multi-Agent Property Intelligence System"
    )
    parser.add_argument(
        "--config", 
        help="Path to configuration file",
        default="openmanus/config/prism_intelligence.toml"
    )
    parser.add_argument(
        "--file", 
        help="Process a single file"
    )
    parser.add_argument(
        "--directory", 
        help="Process all files in directory"
    )
    parser.add_argument(
        "--watch", 
        help="Watch directory for new files"
    )
    parser.add_argument(
        "--interactive", 
        action="store_true",
        help="Run in interactive mode"
    )
    
    args = parser.parse_args()
    
    # Initialize orchestrator
    orchestrator = PrismIntelligenceOrchestrator(args.config)
    
    try:
        if args.file:
            # Process single file
            result = await orchestrator.process_document(args.file)
            print(f"\n📋 Processing Result:")
            print(json.dumps(result, indent=2, default=str))
            
        elif args.directory:
            # Process directory
            results = await orchestrator.process_directory(args.directory)
            successful = sum(1 for r in results if r['status'] == 'success')
            print(f"\n📊 Batch Processing Complete:")
            print(f"   Files processed: {len(results)}")
            print(f"   Successful: {successful}")
            print(f"   Failed: {len(results) - successful}")
            
        elif args.watch:
            # Watch directory
            await orchestrator.watch_directory(args.watch)
            
        elif args.interactive:
            # Interactive mode
            await orchestrator.run_interactive_mode()
            
        else:
            # Default: show help and run interactive mode
            parser.print_help()
            print("\n🚀 Starting interactive mode...")
            await orchestrator.run_interactive_mode()
            
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return 1
    
    return 0


if __name__ == "__main__":
    """Run the PrismIntelligence orchestrator"""
    
    print("🎯 PrismIntelligence Multi-Agent Property Intelligence System")
    print("🤖 Powered by OpenManus + Gemini + Claude")
    print("🏢 Transform property management with AI")
    print()
    
    # Check dependencies
    try:
        import toml
    except ImportError:
        print("❌ Missing dependency: toml")
        print("   Install with: pip install toml")
        sys.exit(1)
    
    # Run the main function
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
