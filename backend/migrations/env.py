from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# 1. Load config
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 2. Import Base and configurations
from app.core.config import settings
from app.core.database import Base

# 3. Import ALL database models to register metadata for auto-generation
from app.models.user import User
from app.models.medication import Medication, MedicationLog
from app.models.telemetry import HealthMetric, Device
from app.models.sos import SosAlert, EmergencyContact
from app.models.report import Report
from app.models.family import FamilyMember
from app.models.chat import ChatMessage
from app.models.triage import SymptomTriageLog

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "pyformat"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section, {})
    # Inject database URL directly from core configurations settings
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    
    connect_args = {}
    if settings.DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
