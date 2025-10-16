// src/app/features/profile/components/address-form/address-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent implements OnInit {
  
  @Input() address: any = null; // Address to edit (null for new)
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  addressForm: FormGroup;
  isSaving = false;

  countries = [
    'Togo', 'Bénin', 'Ghana', 'Nigeria', 'Côte d\'Ivoire', 
    'Burkina Faso', 'Sénégal', 'Mali', 'Niger', 'Cameroun'
  ];

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      type: ['shipping', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      company: [''],
      address_line_1: ['', Validators.required],
      address_line_2: [''],
      city: ['', Validators.required],
      state: [''],
      postal_code: [''],
      country: ['Togo', Validators.required],
      phone: ['', Validators.required],
      is_default: [false]
    });
  }

  ngOnInit(): void {
    if (this.address) {
      this.addressForm.patchValue(this.address);
    }
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      this.isSaving = true;

      setTimeout(() => {
        const formValue = this.addressForm.value;
        this.onSave.emit({
          id: this.address?.id || Date.now().toString(),
          ...formValue
        });
        this.isSaving = false;
      }, 1000);
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  get isEditMode(): boolean {
    return !!this.address;
  }
}