import { TestBed } from '@angular/core/testing';

import { FutDbService } from './fut-db.service';

describe('FutDbService', () => {
  let service: FutDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FutDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
