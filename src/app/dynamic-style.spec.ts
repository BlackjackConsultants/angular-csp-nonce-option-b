import { TestBed } from '@angular/core/testing';

import { DynamicStyle } from './dynamic-style';

describe('DynamicStyle', () => {
  let service: DynamicStyle;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicStyle);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
