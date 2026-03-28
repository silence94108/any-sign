import sys
from pathlib import Path

# Add project root to import path.
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def test_template_response_uses_request_first_signature():
	files = [
		project_root / 'web' / 'app.py',
		project_root / 'web' / 'routes' / 'accounts.py',
		project_root / 'web' / 'routes' / 'logs.py',
		project_root / 'web' / 'routes' / 'providers.py',
	]

	for file_path in files:
		source = file_path.read_text(encoding='utf-8')
		assert 'TemplateResponse(request,' in source
		assert "TemplateResponse('" not in source
