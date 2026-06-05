import os
import re
import yaml

WORKSPACE_PROJECTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def get_workspace_projects():
    """Scans projects/ directory and returns list of valid project names."""
    projects_dir = WORKSPACE_PROJECTS_DIR
    if not os.path.exists(projects_dir):
        return []
        
    project_list = []
    for item in os.listdir(projects_dir):
        item_path = os.path.join(projects_dir, item)
        # We check if it is a directory and not a cockpit itself or hidden folders
        if os.path.isdir(item_path) and not item.startswith(".") and item != "aios-squad-cockpit":
            # Check if it has project-status.yaml or task.md to be considered an active squad project
            yaml_path = os.path.join(item_path, "project-status.yaml")
            task_path = os.path.join(item_path, "task.md")
            if os.path.exists(yaml_path) or os.path.exists(task_path):
                project_list.append(item)
                
    return project_list

def parse_project_status(project_name):
    """Parses project-status.yaml file of the project."""
    project_path = os.path.join(WORKSPACE_PROJECTS_DIR, project_name)
    yaml_path = os.path.join(project_path, "project-status.yaml")
    
    default_status = {
        "name": project_name,
        "status": "planning",
        "phase": "init",
        "team": [],
        "blockers": [],
        "next_milestone": "N/A"
    }
    
    if not os.path.exists(yaml_path):
        return default_status
        
    try:
        with open(yaml_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            if isinstance(data, dict):
                # Merging with default values
                return {**default_status, **data}
    except Exception as e:
        print(f"Error parsing project-status.yaml for {project_name}: {e}")
        
    return default_status

def parse_project_tasks(project_name):
    """Parses task.md file of the project and structures the Kanban tasks."""
    project_path = os.path.join(WORKSPACE_PROJECTS_DIR, project_name)
    task_path = os.path.join(project_path, "task.md")
    
    tasks = []
    if not os.path.exists(task_path):
        return tasks
        
    # Regex to capture task checkboxes: `- [ ]` or `- `[ ]`` or `* [ ]` or `* `[ ]``
    # Status group matches space, / or x (case-insensitive)
    task_regex = re.compile(r'^\s*[-*]\s*(?:`|code)?\[([\s/xX])\](?:`|code)?\s*(.*)$')
    
    # List of known agents to scan inside tasks
    agents = [
        "analyst", "pm", "sm", "architect", "ux-design-expert", "dev", 
        "prompt-engineer", "security-auditor", "lint-and-validate", 
        "doc-coauthoring", "qa", "devops"
    ]
    
    try:
        with open(task_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        task_id_counter = 1
        for line_num, line in enumerate(lines):
            line_str = line.strip()
            match = task_regex.match(line_str)
            if match:
                status_char = match.group(1).lower()
                description = match.group(2).strip()
                
                # Determine status column
                if status_char == "x":
                    status = "done"
                elif status_char == "/":
                    status = "doing"
                else:
                    status = "todo"
                    
                # Identify which agent this task refers to
                assigned_agent = None
                desc_lower = description.lower()
                
                # Check for explicit mentions like @dev or dev in description
                for agent in agents:
                    if f"@{agent}" in desc_lower or agent in desc_lower:
                        assigned_agent = agent
                        break
                        
                # Default mapping based on common phase keywords if not found
                if not assigned_agent:
                    if "test" in desc_lower or "validar" in desc_lower or "verificar" in desc_lower:
                        assigned_agent = "qa"
                    elif "codificar" in desc_lower or "implementar" in desc_lower or "desenvolver" in desc_lower or "escrever" in desc_lower:
                        assigned_agent = "dev"
                    elif "deploy" in desc_lower or "push" in desc_lower or "ci/cd" in desc_lower or "docker" in desc_lower:
                        assigned_agent = "devops"
                    elif "arquitetura" in desc_lower or "design" in desc_lower or "plano" in desc_lower:
                        assigned_agent = "architect"
                    elif "stories" in desc_lower or "user story" in desc_lower or "story" in desc_lower:
                        assigned_agent = "sm"
                    elif "analisar" in desc_lower or "requisitos" in desc_lower:
                        assigned_agent = "analyst"
                    else:
                        assigned_agent = "pm" # Default to PM for coordination tasks
                
                tasks.append({
                    "id": f"task-{task_id_counter}",
                    "text": description,
                    "status": status,
                    "agent": assigned_agent,
                    "line": line_num + 1
                })
                task_id_counter += 1
                
    except Exception as e:
        print(f"Error parsing task.md for {project_name}: {e}")
        
    return tasks
