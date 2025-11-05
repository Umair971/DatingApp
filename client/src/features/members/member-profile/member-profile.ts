import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../Core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../Core/services/toast-service';
import { AccountService } from '../../../Core/services/account-service';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit, OnDestroy {

  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload',['$event']) notify($event:BeforeUnloadEvent){
    if(this.editForm?.dirty){
      $event.preventDefault();
    }
  }
  protected memberService = inject(MemberService);
  private accountService = inject(AccountService);
  protected toast = inject(ToastService);
  protected editableMember: EditableMember = {
    displayName : '',
    description : '',
    city : '',
    country : '',
  }

  constructor(){
    
  }
  ngOnInit(): void {

    this.editableMember = {
      displayName: this.memberService.member()?.displayName || '',
      description: this.memberService.member()?.description || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
    }
  }

  updateProfile() {
    if (!this.memberService.member()) {
      return;
    }
    const updateMember = { ...this.memberService.member(), ...this.editableMember }
    this.memberService.updateMember(this.editableMember).subscribe({
      next: () =>{
        const currentUser = this.accountService.currentUser();
        if(currentUser && updateMember.displayName !== currentUser.displayName){
          currentUser.displayName = updateMember.displayName
          this.accountService.setCurrentUser(currentUser);
        }
        this.toast.success("Profile Updated successfully");
        this.memberService.editMode.set(false);
        this.memberService.member.set(updateMember as Member);
        this.editForm?.reset(updateMember);
      }
    })
  }

    ngOnDestroy(): void {
    if(this.memberService.editMode()){
      this.memberService.editMode.set(false);
    }
  }
}
