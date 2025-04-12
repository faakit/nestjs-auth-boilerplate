import { genSalt, hash } from 'bcrypt';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUser1736654970000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'salt',
            type: 'varchar',
            isNullable: false,
          },
          { name: 'active', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create the first account user with admin/admin credentials
    const salt = await genSalt();
    const email = 'admin@admin.com';
    const password = await hash('admin', salt);

    await queryRunner.query(
      `INSERT INTO user (email, role, password, salt) VALUES ('${email}', 'admin', '${password}', '${salt}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user');

    if (!table) {
      throw new Error('Table "user" does not exist');
    }

    const profileForeignKey = table.foreignKeys.find(
      (fk) => fk.referencedTableName === 'user_profile',
    );
    const storageForeignKey = table.foreignKeys.find(
      (fk) => fk.referencedTableName === 'user_storage',
    );

    if (profileForeignKey) {
      await queryRunner.dropForeignKey('user', profileForeignKey);
    }

    if (storageForeignKey) {
      await queryRunner.dropForeignKey('user', storageForeignKey);
    }

    await queryRunner.dropTable('user');
  }
}
