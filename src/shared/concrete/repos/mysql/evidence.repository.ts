import { IEvidenceRepository } from '../../../abstract/repos/evidence.repository';
import { initMysql } from './connection.manager';
import { mapDbItems, evidenceMapper } from './dbMapper';
import { Evidence } from '@models/evidence';
import { Evidence as EvidenceEntity } from './entity/evidence';
import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import { User } from './entity/user';
import { Product } from './entity/product';
import { Question } from './entity/question';

@injectable()
export class MySQLEvidenceRepository implements IEvidenceRepository {
  async getEvidenceByProjectIdAndQuestionId(
    _productId: number,
    _questionId: number,
  ): Promise<Evidence[]> {
    let connection: any;
    try {
      connection = await initMysql();
      const result = await connection
        .createQueryBuilder()
        .select('evidence')
        .from(EvidenceEntity, 'evidence')
        .where('evidence.productId = :productId', { productId: _productId })
        .andWhere('evidence.questionId = :questionId', {
          questionId: _questionId,
        })
        .orderBy('evidence.id', 'DESC')
        .getRawMany();
      return mapDbItems(result, evidenceMapper);
    } catch (err) {
      throw err;
    } finally {
      if (connection != null) {
        await connection.close();
      }
    }
  }

  async addEvidenceByQuestionId(
    _questionId: number,
    _evidence: Evidence,
  ): Promise<boolean> {
    let connection: any;
    try {
      connection = await initMysql();
      const evidence = new EvidenceEntity();
      evidence.content = _evidence.content;
      evidence.status = _evidence.status;
      evidence.version = _evidence.version;
      const productRepository = getRepository(Product);
      const product = await productRepository.findOneOrFail(
        _evidence.productId,
      );
      evidence.product = product;
      const questionRepository = getRepository(Question);
      const question = await questionRepository.findOneOrFail(_questionId);
      evidence.question = question;
      const userRepository = getRepository(User);
      const user = await userRepository.findOneOrFail(_evidence.userId);
      evidence.user = user;
      await connection.manager.save(evidence);
      return true;
    } catch (err) {
      throw err;
    } finally {
      if (connection != null) {
        await connection.close();
      }
    }
  }

  async updateStatus(_evidenceId: number, _status: string): Promise<boolean> {
    let connection: any;
    try {
      connection = await initMysql();
      await connection
        .createQueryBuilder()
        .update(Evidence)
        .set({
          status: _status,
        })
        .where('Id = :id', { id: _evidenceId })
        .execute();
      return true;
    } catch (err) {
      throw err;
    } finally {
      if (connection != null) {
        await connection.close();
      }
    }
  }

  async getVersionsGroupByDate(
    productId: number,
    questionId: number,
  ): Promise<Evidence[]> {
    let connection: any;
    try {
      connection = await initMysql();

      const result = await connection
        .getRepository(EvidenceEntity)
        .createQueryBuilder('evidence')
        .innerJoin('evidence.user', 'users')
        .select('evidence.createdDate')
        .where('evidence.productId = :productId', { productId })
        .andWhere('evidence.questionId = :questionId', { questionId })
        .groupBy('DATE_FORMAT(evidence.createdDate, "%Y-%m-%d")')
        .getRawMany();
      return mapDbItems(result, evidenceMapper);
    } catch (err) {
      throw err;
    } finally {
      if (connection != null) {
        await connection.close();
      }
    }
  }

  async getEvidenceById(_evidenceId: number): Promise<Evidence[]> {
    let connection: any;
    try {
      connection = await initMysql();
      const result = await connection
        .createQueryBuilder()
        .select('evidence')
        .from(EvidenceEntity, 'evidence')
        .where('evidence.id = :id', { id: _evidenceId })
        .getRawMany();
      return mapDbItems(result, evidenceMapper);
    } catch (err) {
      throw err;
    } finally {
      if (connection != null) {
        await connection.close();
      }
    }
  }

  get(_itemId: number): Evidence {
    throw new Error('Method not implemented.');
  }
  add(_item: Evidence) {
    throw new Error('Method not implemented.');
  }
  update(_itemId: number, _item: Evidence) {
    throw new Error('Method not implemented.');
  }
  delete(_itemId: number) {
    throw new Error('Method not implemented.');
  }
}
